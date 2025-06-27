<?php

namespace App\Http\Controllers;

use App\Models\Employee;
use App\Models\ClientDetail;
use App\Models\Vendor;
use App\Models\Item;
use App\Models\Enquiry;
use App\Models\Quotation;
use App\Models\SalesOrder;
use App\Models\PurchaseIntent;
use App\Models\PurchaseOrder;
use App\Models\StockMovement;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        $stats = $this->getDashboardStats();
        $recentActivities = $this->getRecentActivities();
        $stockAlerts = $this->getStockAlerts();
        $pendingApprovals = $this->getPendingApprovals();
        $monthlyData = $this->getMonthlyData();

        return Inertia::render('dashboard', [
            'stats' => $stats,
            'recentActivities' => $recentActivities,
            'stockAlerts' => $stockAlerts,
            'pendingApprovals' => $pendingApprovals,
            'monthlyData' => $monthlyData,
        ]);
    }

    private function getDashboardStats()
    {
        return [
            'employees' => [
                'total' => Employee::count(),
                'active' => Employee::whereHas('serviceDetails', function ($q) {
                    $q->whereNull('relieving_date');
                })->count(),
                'new_this_month' => Employee::whereHas('joiningDetails', function ($q) {
                    $q->whereMonth('joining_date', now()->month);
                })->count(),
            ],
            'clients' => [
                'total' => ClientDetail::count(),
                'active' => ClientDetail::where('status', 'active')->count(),
                'new_this_month' => ClientDetail::whereMonth('created_at', now()->month)->count(),
            ],
            'vendors' => [
                'total' => Vendor::count(),
                'active' => Vendor::where('status', 'active')->count(),
                'new_this_month' => Vendor::whereMonth('created_at', now()->month)->count(),
            ],
            'inventory' => [
                'total_items' => Item::count(),
                'low_stock' => Item::where('current_stock', '<=', DB::raw('minimum_stock'))->count(),
                'out_of_stock' => Item::where('current_stock', 0)->count(),
                'total_value' => Item::sum(DB::raw('current_stock * standard_cost')),
            ],
            'sales' => [
                'enquiries' => Enquiry::count(),
                'quotations' => Quotation::count(),
                'orders' => SalesOrder::count(),
                'pending_quotations' => Quotation::whereIn('status', ['draft', 'pending_review', 'pending_approval'])->count(),
            ],
            'purchases' => [
                'intents' => PurchaseIntent::count(),
                'orders' => PurchaseOrder::count(),
                'pending_orders' => PurchaseOrder::whereIn('status', ['draft', 'pending_approval'])->count(),
            ],
        ];
    }

    private function getRecentActivities()
    {
        $activities = collect();

        // Recent enquiries
        $enquiries = Enquiry::with(['client', 'creator'])
            ->latest()
            ->limit(5)
            ->get()
            ->map(function ($enquiry) {
                return [
                    'type' => 'enquiry',
                    'id' => $enquiry->id,
                    'title' => $enquiry->subject,
                    'description' => 'New enquiry from ' . $enquiry->client->name,
                    'status' => $enquiry->status,
                    'date' => $enquiry->created_at,
                    'user' => $enquiry->creator->name ?? 'System',
                ];
            });

        // Recent quotations
        $quotations = Quotation::with(['client', 'creator'])
            ->latest()
            ->limit(5)
            ->get()
            ->map(function ($quotation) {
                return [
                    'type' => 'quotation',
                    'id' => $quotation->id,
                    'title' => $quotation->subject,
                    'description' => 'Quotation for ' . $quotation->client->name,
                    'status' => $quotation->status,
                    'date' => $quotation->created_at,
                    'user' => $quotation->creator->name ?? 'System',
                ];
            });

        // Recent stock movements
        $stockMovements = StockMovement::with(['movable', 'creator'])
            ->latest()
            ->limit(5)
            ->get()
            ->map(function ($movement) {
                return [
                    'type' => 'stock_movement',
                    'id' => $movement->id,
                    'title' => $movement->movable->name ?? 'Stock Movement',
                    'description' => ucfirst($movement->type) . ' - ' . $movement->quantity . ' units' . ($movement->reason ? ' (' . $movement->reason . ')' : ''),
                    'status' => $movement->type,
                    'date' => $movement->created_at,
                    'user' => $movement->creator->name ?? 'System',
                ];
            });

        return $activities->merge($enquiries)
            ->merge($quotations)
            ->merge($stockMovements)
            ->sortByDesc('date')
            ->take(10)
            ->values();
    }

    private function getStockAlerts()
    {
        return Item::where('current_stock', '<=', DB::raw('minimum_stock'))
            ->orWhere('current_stock', 0)
            ->with('category')
            ->limit(10)
            ->get()
            ->map(function ($item) {
                $status = $item->current_stock == 0 ? 'out_of_stock' : 'low_stock';
                return [
                    'id' => $item->id,
                    'name' => $item->name,
                    'code' => $item->code,
                    'current_stock' => $item->current_stock,
                    'minimum_stock' => $item->minimum_stock,
                    'status' => $status,
                    'category' => $item->category->name ?? 'Uncategorized',
                ];
            });
    }

    private function getPendingApprovals()
    {
        $pending = collect();

        // Pending quotations
        $pendingQuotations = Quotation::whereIn('status', ['pending_review', 'pending_approval'])
            ->with(['client', 'creator'])
            ->limit(5)
            ->get()
            ->map(function ($quotation) {
                return [
                    'type' => 'quotation',
                    'id' => $quotation->id,
                    'title' => $quotation->subject,
                    'description' => 'Quotation for ' . $quotation->client->name,
                    'status' => $quotation->status,
                    'date' => $quotation->created_at,
                    'user' => $quotation->creator->name ?? 'System',
                ];
            });

        // Pending purchase orders
        $pendingOrders = PurchaseOrder::whereIn('status', ['pending_approval'])
            ->with(['vendor', 'creator'])
            ->limit(5)
            ->get()
            ->map(function ($order) {
                return [
                    'type' => 'purchase_order',
                    'id' => $order->id,
                    'title' => $order->po_no,
                    'description' => 'Purchase order for ' . ($order->vendor->name ?? 'Unknown Vendor'),
                    'status' => $order->status,
                    'date' => $order->created_at,
                    'user' => $order->creator->name ?? 'System',
                ];
            });

        return $pending->merge($pendingQuotations)
            ->merge($pendingOrders)
            ->sortByDesc('date')
            ->take(10)
            ->values();
    }

    private function getMonthlyData()
    {
        $months = collect();
        for ($i = 5; $i >= 0; $i--) {
            $date = now()->subMonths($i);
            $months->push([
                'month' => $date->format('M Y'),
                'enquiries' => Enquiry::whereMonth('created_at', $date->month)
                    ->whereYear('created_at', $date->year)
                    ->count(),
                'quotations' => Quotation::whereMonth('created_at', $date->month)
                    ->whereYear('created_at', $date->year)
                    ->count(),
                'orders' => SalesOrder::whereMonth('created_at', $date->month)
                    ->whereYear('created_at', $date->year)
                    ->count(),
                'purchases' => PurchaseOrder::whereMonth('created_at', $date->month)
                    ->whereYear('created_at', $date->year)
                    ->count(),
            ]);
        }

        return $months;
    }
}

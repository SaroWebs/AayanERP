<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use App\Models\Employee;
use Illuminate\Http\Request;

class EmployeeController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        return Inertia::render('hr/employees/index');
    }

    public function paginatedlist(Request $request)
    {
        $employees = Employee::query()
            ->when($request->input('search'), function ($query, $search) {
                $query->where('name', 'like', "%{$search}%");
            })
            ->when($request->input('sort'), function ($query, $sort, $request) {
                $direction = $request->input('direction', 'asc');
                $query->orderBy($sort, $direction);
            })
            ->paginate($request->input('per_page', 20))
            ->withQueryString();

        return response()->json($employees);
    }

    public function store(Request $request) {
        // 
    }
}

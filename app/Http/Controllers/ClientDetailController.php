<?php

namespace App\Http\Controllers;

use App\Models\ClientDetail;
use Illuminate\Http\Request;

class ClientDetailController extends Controller
{
    
    public function paginatedlist(Request $request) {
        $clients = ClientDetail::query()
            ->when($request->input('search'), function ($query, $search) {
                $query->where('name', 'like', "%{$search}%");
            })
            ->when($request->input('sort'), function ($query, $sort, $request) {
                $direction = $request->input('direction', 'asc');
                $query->orderBy($sort, $direction);
            })
            ->with(['bankAccounts', 'contactDetails', 'documents'])
            ->paginate($request->input('per_page', 20))
            ->withQueryString();

        return response()->json($clients);
    }
}

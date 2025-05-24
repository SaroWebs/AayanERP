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
        $employees = null;
        // $employees = Employee::query()
        //     ->when($request->input('search'), function ($query, $search) {
        //         $query->where('name', 'like', "%{$search}%");
        //     })
        //     ->when($request->input('sort'), function ($query, $sort, $request) {
        //         $direction = $request->input('direction', 'asc');
        //         $query->orderBy($sort, $direction);
        //     })
        //     ->paginate($request->input('per_page', 20))
        //     ->withQueryString();

        return Inertia::render('hr/employees/index', ['employees' => $employees]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(Employee $employee)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Employee $employee)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Employee $employee)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Employee $employee)
    {
        //
    }
}

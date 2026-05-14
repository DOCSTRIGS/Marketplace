<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Hash;

class DriverController extends Controller
{
    public function index()
    {
        (new \App\Services\DeliveryAssignmentService())->resetExpiredPauses();

        $drivers = User::where('role', 'driver')
            ->orderBy('deliveries_completed', 'desc')
            ->get();

        return Inertia::render('Admin/Drivers', [
            'drivers' => $drivers
        ]);
    }

    public function show(User $driver)
    {
        $orders = \App\Models\Order::where('driver_id', $driver->id)
            ->where('status', 'delivered')
            ->with(['shop', 'user'])
            ->latest('delivered_at')
            ->get();

        $logs = \App\Models\DriverLog::where('user_id', $driver->id)
            ->latest('occurred_at')
            ->get();

        if (request()->wantsJson()) {
            return response()->json([
                'driver' => $driver,
                'orders' => $orders,
                'logs' => $logs
            ]);
        }

        return redirect()->route('admin.dashboard', ['tab' => 'drivers']);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8',
        ]);

        User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role' => 'driver',
            'driver_status' => 'offline'
        ]);

        return back()->with('success', 'Livreur ajouté avec succès.');
    }

    public function update(Request $request, User $driver)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,'.$driver->id,
            'driver_status' => 'required|string|in:offline,available,busy,pause'
        ]);

        $oldStatus = $driver->driver_status;
        $driver->update($validated);

        // Log Pause Events
        if ($validated['driver_status'] === 'pause' && $oldStatus !== 'pause') {
            \App\Models\DriverLog::create([
                'user_id' => $driver->id,
                'event_type' => 'pause_start',
                'occurred_at' => now(),
            ]);
            $driver->update(['pause_started_at' => now()]);
        } elseif ($validated['driver_status'] !== 'pause' && $oldStatus === 'pause') {
            \App\Models\DriverLog::create([
                'user_id' => $driver->id,
                'event_type' => 'pause_end',
                'occurred_at' => now(),
            ]);
            $driver->update(['pause_started_at' => null]);
        }

        return back()->with('success', 'Livreur mis à jour.');
    }

    public function destroy(User $driver)
    {
        $driver->delete();
        return back()->with('success', 'Livreur supprimé avec succès.');
    }

    /**
     * Get all drivers with their positions for the Admin Fleet Map.
     */
    public function getFleetPositions()
    {
        $drivers = User::where('role', 'driver')
            ->where('driver_status', '!=', 'offline')
            ->select('id', 'name', 'driver_status', 'last_latitude', 'last_longitude', 'deliveries_completed', 'updated_at')
            ->get();

        return response()->json($drivers);
    }
}

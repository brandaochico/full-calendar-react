<?php

namespace Tests\Feature;

use App\Models\Appointment;
use App\Models\User;
use Database\Seeders\AppointmentSeeder;
use Database\Seeders\BlockSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class BlockStoreTest extends TestCase
{
    use RefreshDatabase;

    public function test_authenticated_user_can_create_a_block_for_an_appointment(): void
    {
        $this->seed(AppointmentSeeder::class);

        $user = User::factory()->create();
        $appointment = Appointment::findOrFail(1);

        $response = $this->actingAs($user)->post(route('blocks.store'), [
            'appointment_id' => 1,
            'start_time' => '08:15',
            'finish_time' => '08:30',
            'start_at' => $appointment->start_time->copy()->addMinutes(15)->toIso8601String(),
            'finish_at' => $appointment->start_time->copy()->addMinutes(30)->toIso8601String(),
        ]);

        $response->assertRedirect(route('home', absolute: false));

        $this->assertDatabaseHas('bloqueios', [
            'appointment_id' => 1,
            'label' => 'Bloqueio manual',
            'start_time' => now()->startOfWeek()->setTime(8, 15)->toDateTimeString(),
            'finish_time' => now()->startOfWeek()->setTime(8, 30)->toDateTimeString(),
        ]);
    }

    public function test_block_creation_rejects_overlaps_with_existing_blocks(): void
    {
        $this->seed([
            AppointmentSeeder::class,
            BlockSeeder::class,
        ]);

        $user = User::factory()->create();
        $appointment = Appointment::findOrFail(1);

        $response = $this->from(route('home'))->actingAs($user)->post(route('blocks.store'), [
            'appointment_id' => 1,
            'start_time' => '08:50',
            'finish_time' => '09:10',
            'start_at' => $appointment->start_time->copy()->addMinutes(50)->toIso8601String(),
            'finish_at' => $appointment->start_time->copy()->addMinutes(70)->toIso8601String(),
        ]);

        $response->assertRedirect(route('home', absolute: false));
        $response->assertSessionHasErrors(['start_time']);
        $this->assertDatabaseCount('bloqueios', 2);
    }

    public function test_guests_can_not_create_blocks(): void
    {
        $this->seed(AppointmentSeeder::class);
        $appointment = Appointment::findOrFail(1);

        $response = $this->post(route('blocks.store'), [
            'appointment_id' => 1,
            'start_time' => '08:15',
            'finish_time' => '08:30',
            'start_at' => $appointment->start_time->copy()->addMinutes(15)->toIso8601String(),
            'finish_at' => $appointment->start_time->copy()->addMinutes(30)->toIso8601String(),
        ]);

        $response->assertRedirect(route('login', absolute: false));
    }
}

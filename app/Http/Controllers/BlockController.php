<?php

namespace App\Http\Controllers;

use App\Models\Appointment;
use App\Models\Block;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class BlockController extends Controller
{
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'appointment_id' => ['required', 'integer', 'exists:appointments,id'],
            'start_time' => ['required', 'date_format:H:i'],
            'finish_time' => ['required', 'date_format:H:i'],
            'start_at' => ['required', 'date'],
            'finish_at' => ['required', 'date'],
        ]);

        $appointment = Appointment::with('blocks')->findOrFail($validated['appointment_id']);
        $blockStart = Carbon::parse($validated['start_at']);
        $blockEnd = Carbon::parse($validated['finish_at']);

        if ($blockStart->gte($blockEnd)) {
            throw ValidationException::withMessages([
                'finish_time' => 'O horário final deve ser maior que o horário inicial.',
            ]);
        }

        if ($blockStart->lt($appointment->start_time) || $blockEnd->gt($appointment->finish_time)) {
            throw ValidationException::withMessages([
                'start_time' => 'O bloqueio deve estar dentro do intervalo original da consulta.',
            ]);
        }

        $hasOverlap = $appointment->blocks->contains(function (Block $block) use ($blockStart, $blockEnd) {
            return $blockStart->lt($block->finish_time) && $blockEnd->gt($block->start_time);
        });

        if ($hasOverlap) {
            throw ValidationException::withMessages([
                'start_time' => 'Esse bloqueio conflita com outro bloqueio já existente.',
            ]);
        }

        Block::create([
            'appointment_id' => $appointment->id,
            'start_time' => $blockStart,
            'finish_time' => $blockEnd,
            'label' => 'Bloqueio manual',
        ]);

        return to_route('home');
    }
}

<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Carbon;
use App\Models\LeaveType;

class LeaveTypeSeeder extends Seeder
{
    public function run()
    {
        $leaveTypes = [
            [
                'name' => 'Congé Annuel',
                'description' => 'Congé annuel payé',
                'is_active' => true,
                'max_days' => 30, // ✅ CORRECTION: utiliser 'max_days' au lieu de 'max_days_per_year'
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ],
            [
                'name' => 'Congé Maladie',
                'description' => 'Congé pour raisons médicales',
                'is_active' => true,
                'max_days' => 15, // ✅ CORRECTION: utiliser 'max_days' au lieu de 'max_days_per_year'
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ],
            [
                'name' => 'Congé Maternité',
                'description' => 'Congé de maternité',
                'max_days' => 98,
                'is_active' => true,
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ],
            [
                'name' => 'Congé Exceptionnel',
                'description' => 'Congé pour événements familiaux',
                'max_days' => 10,
                'is_active' => true,
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ],
        ];

        foreach ($leaveTypes as $type) {
            LeaveType::updateOrCreate(
                ['name' => $type['name']],
                $type
            );
        }

        $this->command->info('✅ Types de congés créés avec succès.');
    }
}

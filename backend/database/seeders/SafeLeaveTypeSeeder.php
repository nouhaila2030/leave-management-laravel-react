<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\LeaveType;

class SafeLeaveTypeSeeder extends Seeder
{
    public function run()
    {
        $leaveTypes = [
            [
                'name' => 'Congé Annuel',
                'description' => 'Congé annuel payé',
                'max_days' => 22,
                'is_active' => true,
            ],
            [
                'name' => 'Congé Maladie',
                'description' => 'Congé pour raisons médicales',
                'max_days' => 90,
                'is_active' => true,
            ],
            [
                'name' => 'Congé Maternité',
                'description' => 'Congé de maternité',
                'max_days' => 98,
                'is_active' => true,
            ],
            [
                'name' => 'Congé Exceptionnel',
                'description' => 'Congé pour événements familiaux',
                'max_days' => 10,
                'is_active' => true,
            ],
        ];

        foreach ($leaveTypes as $type) {
            LeaveType::firstOrCreate(
                ['name' => $type['name']], // Condition de recherche
                $type // Données à créer si n'existe pas
            );
        }

        $this->command->info('✅ Types de congés créés avec succès');
    }
}

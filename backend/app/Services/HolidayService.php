<?php

namespace App\Services;

use Carbon\Carbon;

class HolidayService
{
    // Jours fériés fixes au Maroc
    private static $fixedHolidays = [
        '01-01' => 'Nouvel An',
        '01-11' => 'Anniversaire du Manifeste de l\'Indépendance',
        '01-14' => 'Nouvel An Amazigh',
        '05-01' => 'Fête du Travail',
        '07-30' => 'Fête du Trône',
        '08-14' => 'Anniversaire de la Récupération de Oued Eddahab',
        '08-20' => 'Révolution du Roi et du Peuple',
        '08-21' => 'Fête de la Jeunesse',
        '11-06' => 'Anniversaire de la Marche Verte',
        '11-18' => 'Fête de l\'Indépendance',
    ];

    /**
     * Vérifier si une date est un jour férié
     */
    public static function isHoliday(Carbon $date): bool
    {
        $monthDay = $date->format('m-d');
        return array_key_exists($monthDay, self::$fixedHolidays);
    }

    /**
     * Vérifier si une date est un weekend (samedi ou dimanche)
     */
    public static function isWeekend(Carbon $date): bool
    {
        return $date->isWeekend();
    }

    /**
     * Calculer le nombre de jours ouvrables entre deux dates
     */
    public static function calculateWorkingDays(Carbon $startDate, Carbon $endDate): int
    {
        $workingDays = 0;
        $currentDate = $startDate->copy();

        while ($currentDate->lte($endDate)) {
            if (!self::isWeekend($currentDate) && !self::isHoliday($currentDate)) {
                $workingDays++;
            }
            $currentDate->addDay();
        }

        return $workingDays;
    }

    /**
     * Obtenir la liste des jours fériés pour une année donnée
     */
    public static function getHolidaysForYear(int $year): array
    {
        $holidays = [];
        foreach (self::$fixedHolidays as $monthDay => $name) {
            $holidays[] = [
                'date' => Carbon::createFromFormat('Y-m-d', $year . '-' . $monthDay),
                'name' => $name
            ];
        }
        return $holidays;
    }
}

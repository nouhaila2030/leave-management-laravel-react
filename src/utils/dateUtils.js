// Jours fériés fixes au Maroc
const MOROCCAN_HOLIDAYS = [
  { month: 1, day: 1, name: "Nouvel An" },
  { month: 1, day: 11, name: "Anniversaire du Manifeste de l'Indépendance" },
  { month: 1, day: 14, name: "Nouvel An Amazigh" },
  { month: 5, day: 1, name: "Fête du Travail" },
  { month: 7, day: 30, name: "Fête du Trône" },
  { month: 8, day: 14, name: "Anniversaire de la Récupération de Oued Eddahab" },
  { month: 8, day: 20, name: "Révolution du Roi et du Peuple" },
  { month: 8, day: 21, name: "Fête de la Jeunesse" },
  { month: 11, day: 6, name: "Anniversaire de la Marche Verte" },
  { month: 11, day: 18, name: "Fête de l'Indépendance" },
]

// Vérifier si une date est un jour férié
export const isHoliday = (date) => {
  const month = date.getMonth() + 1
  const day = date.getDate()

  return MOROCCAN_HOLIDAYS.some((holiday) => holiday.month === month && holiday.day === day)
}

// Vérifier si une date est un weekend (samedi ou dimanche)
export const isWeekend = (date) => {
  const dayOfWeek = date.getDay()
  return dayOfWeek === 0 || dayOfWeek === 6 // 0 = dimanche, 6 = samedi
}

// Vérifier si une date est un jour ouvrable
export const isWorkingDay = (date) => {
  return !isWeekend(date) && !isHoliday(date)
}

// Calculer le nombre de jours ouvrables entre deux dates
export const calculateWorkingDays = (startDate, endDate) => {
  if (!startDate || !endDate) return 0

  const start = new Date(startDate)
  const end = new Date(endDate)

  if (start > end) return 0

  let workingDays = 0
  const currentDate = new Date(start)

  while (currentDate <= end) {
    if (isWorkingDay(currentDate)) {
      workingDays++
    }
    currentDate.setDate(currentDate.getDate() + 1)
  }

  return workingDays
}

// Obtenir la liste des jours fériés pour une année donnée
export const getHolidaysForYear = (year) => {
  return MOROCCAN_HOLIDAYS.map((holiday) => ({
    ...holiday,
    date: new Date(year, holiday.month - 1, holiday.day),
    dateString: `${holiday.day}/${holiday.month}/${year}`,
  }))
}

// Formater une date en français
export const formatDateFR = (date) => {
  return new Date(date).toLocaleDateString("fr-FR")
}

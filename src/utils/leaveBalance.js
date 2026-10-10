// Constantes pour les congés
export const ANNUAL_LEAVE_DAYS = 22

// Calculer le solde de congés pour un employé
export const calculateLeaveBalance = (usedDays = 0, year = new Date().getFullYear()) => {
  const totalDays = ANNUAL_LEAVE_DAYS
  const remainingDays = Math.max(0, totalDays - usedDays)

  return {
    totalDays,
    usedDays,
    remainingDays,
    year,
  }
}

// Vérifier si l'employé a assez de jours disponibles
export const hasEnoughLeaveDays = (requestedDays, currentBalance) => {
  return requestedDays <= currentBalance.remainingDays
}

// Calculer le nouveau solde après une demande
export const calculateNewBalance = (currentBalance, requestedDays) => {
  return {
    ...currentBalance,
    usedDays: currentBalance.usedDays + requestedDays,
    remainingDays: Math.max(0, currentBalance.remainingDays - requestedDays),
  }
}

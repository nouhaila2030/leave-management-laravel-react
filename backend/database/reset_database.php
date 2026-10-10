<?php

// Script à exécuter depuis la racine du projet Laravel
echo "🔄 Réinitialisation de la base de données...\n";

system('php artisan migrate:fresh --seed');

echo "\n🎉 Base de données réinitialisée avec succès!\n";
echo "\n📋 Comptes de test créés:\n";
echo "👤 Admin: admin@leave-management.local / password123\n";
echo "👤 Employé: employee@leave-management.local / password111\n";
echo "\n🚀 Vous pouvez maintenant vous connecter!\n";

<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Attestation de Congés</title>
<style>
    body {
        font-family: 'Times New Roman', serif;
        margin: 0;
        padding: 2cm;
        font-size: 12pt;
        line-height: 1.5;
    }
    .header {
        text-align: center;
        margin-bottom: 2cm;
    }
    .header p {
        margin: 0;
        font-size: 11pt;
    }
    .title {
        text-align: center;
        font-size: 20pt;
        font-weight: bold;
        margin-bottom: 1.5cm;
    }
    .content {
        margin-bottom: 2cm;
    }
    .content p {
        margin-bottom: 1em;
    }
    .signature-block {
        margin-top: 5cm;
    }
    .signature-block .date {
        margin-bottom: 1cm;
        text-align: left;
    }
    .signature-block .right {
        text-align: right;
        width: 75%;
    }
    .signature-block div {
        width: 45%;
    }
    .bold {
        font-weight: bold;
    }
</style>
</head>
<body>

<div class="header">
    <p>Administration Publique</p>
    <p>Portail de Gestion des Congés</p>
</div>

<div class="title">
    Attestation de congés
</div>

<div class="content">
    <p>Nous, soussignés, le responsable des ressources humaines, représentant légal de l'administration, certifions par la présente que l'employé(e) <span class="bold">{{ $employee->full_name ?? 'NOM_EMPLOYE_INCONNU' }}</span>, occupant le poste de <span class="bold">{{ $employee->position ?? 'POSTE_INCONNU' }}</span> au sein de notre institution, bénéficie d'un droit à un congé de <span class="bold">{{ $leaveRequest->total_days ?? '0' }}</span> jours, allant du <span class="bold">{{ \Carbon\Carbon::parse($leaveRequest->start_date ?? 'now')->format('d/m/Y') }}</span> au <span class="bold">{{ \Carbon\Carbon::parse($leaveRequest->end_date ?? 'now')->format('d/m/Y') }}</span>.</p>
    <p>Ce droit à congé est conforme aux dispositions légales en vigueur et est accordé en fonction de la durée de service de l'employé(e) au sein de notre institution.</p>
    <p>Nous vous prions de bien vouloir prendre en considération cette attestation, qui est établie à des fins administratives.</p>
</div>

<div class="signature-block">
    <div class="date">
        Fait le {{ \Carbon\Carbon::now()->format('d/m/Y') }}
    </div>
    <div class="right">
        Signature et cachet
    </div>
</div>
</body>
</html>

<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use App\Services\PaymentGenerator;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Artisan::command('payments:generate-monthly', function () {
    $count = PaymentGenerator::generateMonthlyInvoices();
    $this->info('Generated '.$count.' invoices for occupied rooms.');
})->purpose('Generate monthly payment invoices for all occupied rooms');

<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Support\Str;
use App\Models\CategoryType;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Permission;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Core system seeders
        $this->call([
            RoleAndPermissionSeeder::class,
            UserSeeder::class,
            DepartmentSeeder::class,
            CategorySeeder::class,
        ]);

        // HR Module seeders
        $this->call([
            EmployeeSeeder::class,
            EmployeeAddressSeeder::class,
            EmployeeDocumentSeeder::class,
            EmpEducationalQualificationSeeder::class,
            EmpProfessionalQualificationSeeder::class,
            EmploymentDetailSeeder::class,
            EmpJoiningDetailSeeder::class,
            EmployeeSpouseSeeder::class,
            EmployeeChildSeeder::class,
            EmployeeCurricularActivitySeeder::class,
            EmployeeKnownLanguageSeeder::class,
            EmployeeSpecialTrainingSeeder::class,
            EmployeeNomineeSeeder::class,
            EmployeeReferenceSeeder::class,
        ]);

        // Vendor Module seeders
        $this->call([
            VendorSeeder::class,
            VendorBankAccountSeeder::class,
            VendorContactDetailSeeder::class,
            VendorDocumentSeeder::class,
        ]);

        // Client Module seeders
        $this->call([
            ClientDetailSeeder::class,
            ClientBankAccountSeeder::class,
            ClientContactDetailSeeder::class,
            ClientDocumentSeeder::class,
        ]);

        // // Sales Module seeders
        // $this->call([
        //     EnquirySeeder::class,
        //     QuotationSeeder::class,
        //     SalesOrderSeeder::class,
        //     SalesBillSeeder::class,
        //     SalesPaymentSeeder::class,
        //     DispatchSeeder::class,
        // ]);

        // // Purchase Module seeders
        // $this->call([
        //     PurchaseIntentSeeder::class,
        //     PurchaseOrderSeeder::class,
        //     GoodsReceiptNoteSeeder::class,
        //     PurchasePaymentSeeder::class,
        // ]);
    }
}

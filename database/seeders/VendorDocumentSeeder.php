<?php

namespace Database\Seeders;

use App\Models\VendorDocument;
use Illuminate\Database\Seeder;

class VendorDocumentSeeder extends Seeder
{
    public function run(): void
    {
        $documents = [
            [
                'vendor_id' => 1,
                'document_type' => 'GST Certificate',
                'document_name' => 'GST Registration Certificate',
                'document_number' => 'GST123456',
                'remarks' => 'Valid until 2025',
                'sharing_option' => 'public',
                'document_path' => 'documents/vendors/vendor1/gst_certificate.pdf'
            ],
            [
                'vendor_id' => 1,
                'document_type' => 'PAN Card',
                'document_name' => 'PAN Card Copy',
                'document_number' => 'ABCDE1234F',
                'remarks' => 'Permanent document',
                'sharing_option' => 'private',
                'document_path' => 'documents/vendors/vendor1/pan_card.pdf'
            ],
            [
                'vendor_id' => 2,
                'document_type' => 'GST Certificate',
                'document_name' => 'GST Registration Certificate',
                'document_number' => 'GST789012',
                'remarks' => 'Valid until 2025',
                'sharing_option' => 'public',
                'document_path' => 'documents/vendors/vendor2/gst_certificate.pdf'
            ],
            [
                'vendor_id' => 2,
                'document_type' => 'PAN Card',
                'document_name' => 'PAN Card Copy',
                'document_number' => 'XYZDE1234F',
                'remarks' => 'Permanent document',
                'sharing_option' => 'private',
                'document_path' => 'documents/vendors/vendor2/pan_card.pdf'
            ],
        ];

        foreach ($documents as $document) {
            VendorDocument::create($document);
        }
    }
} 
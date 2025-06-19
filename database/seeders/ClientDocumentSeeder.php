<?php

namespace Database\Seeders;

use App\Models\ClientDocument;
use Illuminate\Database\Seeder;

class ClientDocumentSeeder extends Seeder
{
    public function run(): void
    {
        $documents = [
            [
                'client_detail_id' => 1,
                'document_type' => 'GST Certificate',
                'document_name' => 'GST Registration Certificate',
                'document_number' => 'GST123456',
                'remarks' => 'Valid until 2025',
                'sharing_option' => 'public',
                'document_path' => 'documents/clients/client1/gst_certificate.pdf'
            ],
            [
                'client_detail_id' => 1,
                'document_type' => 'PAN Card',
                'document_name' => 'PAN Card Copy',
                'document_number' => 'ABCDE1234F',
                'remarks' => 'Permanent document',
                'sharing_option' => 'private',
                'document_path' => 'documents/clients/client1/pan_card.pdf'
            ],
            [
                'client_detail_id' => 2,
                'document_type' => 'GST Certificate',
                'document_name' => 'GST Registration Certificate',
                'document_number' => 'GST789012',
                'remarks' => 'Valid until 2025',
                'sharing_option' => 'public',
                'document_path' => 'documents/clients/client2/gst_certificate.pdf'
            ],
            [
                'client_detail_id' => 2,
                'document_type' => 'PAN Card',
                'document_name' => 'PAN Card Copy',
                'document_number' => 'XYZDE1234F',
                'remarks' => 'Permanent document',
                'sharing_option' => 'private',
                'document_path' => 'documents/clients/client2/pan_card.pdf'
            ],
        ];

        foreach ($documents as $document) {
            ClientDocument::create($document);
        }
    }
} 
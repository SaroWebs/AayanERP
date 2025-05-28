import React from 'react';
import { Button, TextInput, Textarea } from '@mantine/core';
import { ProfessionalQualification } from '../types';

interface ProfessionalDetailsProps {
  professionalList: ProfessionalQualification[];
  professionalInput: ProfessionalQualification;
  editingProfessionalIndex: number | null;
  onProfessionalInputChange: (input: ProfessionalQualification) => void;
  onAddProfessional: () => void;
  onResetProfessionalForm: () => void;
  onEditProfessional: (index: number) => void;
  onDeleteProfessional: (index: number) => void;
  validateRequiredFields: (data: ProfessionalQualification, requiredFields: (keyof ProfessionalQualification)[]) => boolean;
  requiredFields: (keyof ProfessionalQualification)[];
}

const ProfessionalDetails: React.FC<ProfessionalDetailsProps> = ({
  professionalList,
  professionalInput,
  editingProfessionalIndex,
  onProfessionalInputChange,
  onAddProfessional,
  onResetProfessionalForm,
  onEditProfessional,
  onDeleteProfessional,
  validateRequiredFields,
  requiredFields,
}) => {
  return (
    <div className="border p-4 rounded">
      <h4 className="font-semibold mb-2">Professional Qualification Details</h4>
      <div className="grid grid-cols-4 gap-2 mb-2">
        <TextInput
          label="Exam Name"
          value={professionalInput.exam_name}
          onChange={e => onProfessionalInputChange({ ...professionalInput, exam_name: e.target.value })}
          required
        />
        <TextInput
          label="Institution"
          value={professionalInput.institution}
          onChange={e => onProfessionalInputChange({ ...professionalInput, institution: e.target.value })}
          required
        />
        <TextInput
          label="Division"
          value={professionalInput.division || ''}
          onChange={e => onProfessionalInputChange({ ...professionalInput, division: e.target.value })}
        />
        <TextInput
          label="Completion Year"
          value={professionalInput.completion_year}
          onChange={e => onProfessionalInputChange({ ...professionalInput, completion_year: e.target.value })}
          type="number"
          required
        />
        <TextInput
          label="Certificate Number"
          value={professionalInput.certificate_number || ''}
          onChange={e => onProfessionalInputChange({ ...professionalInput, certificate_number: e.target.value })}
        />
        <TextInput
          label="Valid From"
          type="date"
          value={professionalInput.valid_from || ''}
          onChange={e => onProfessionalInputChange({ ...professionalInput, valid_from: e.target.value })}
        />
        <TextInput
          label="Valid Until"
          type="date"
          value={professionalInput.valid_until || ''}
          onChange={e => onProfessionalInputChange({ ...professionalInput, valid_until: e.target.value })}
        />
        <Textarea
          label="Remarks"
          value={professionalInput.remarks || ''}
          onChange={e => onProfessionalInputChange({ ...professionalInput, remarks: e.target.value })}
        />
      </div>
      <Button
        type="button"
        onClick={onAddProfessional}
        className="mb-2"
        disabled={!validateRequiredFields(professionalInput, requiredFields)}
      >
        {editingProfessionalIndex !== null ? 'Update' : 'Add'}
      </Button>
      <Button type="button" onClick={onResetProfessionalForm} className="mb-2 ml-2">Clear</Button>
      <table className="w-full text-xs border mt-2">
        <thead>
          <tr className="bg-gray-100">
            <th>SN</th>
            <th>Exam Name</th>
            <th>Institution</th>
            <th>Division</th>
            <th>Completion Year</th>
            <th>Certificate Number</th>
            <th>Valid From</th>
            <th>Valid Until</th>
            <th>Remarks</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {professionalList.map((item, idx) => (
            <tr key={idx}>
              <td>{idx + 1}</td>
              <td>{item.exam_name}</td>
              <td>{item.institution}</td>
              <td>{item.division}</td>
              <td>{item.completion_year}</td>
              <td>{item.certificate_number}</td>
              <td>{item.valid_from}</td>
              <td>{item.valid_until}</td>
              <td>{item.remarks}</td>
              <td>
                <Button size="xs" variant="subtle" color="blue" onClick={() => onEditProfessional(idx)}>Edit</Button>
                <Button size="xs" variant="subtle" color="red" onClick={() => onDeleteProfessional(idx)}>Delete</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ProfessionalDetails; 
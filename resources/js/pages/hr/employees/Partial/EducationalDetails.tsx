import React from 'react';
import { Button, TextInput, Select } from '@mantine/core';
import { EducationalQualification } from '../types';

interface EducationalDetailsProps {
  educationalList: EducationalQualification[];
  educationalInput: EducationalQualification;
  editingEducationalIndex: number | null;
  onEducationalInputChange: (input: EducationalQualification) => void;
  onAddEducational: () => void;
  onResetEducationalForm: () => void;
  onEditEducational: (index: number) => void;
  onDeleteEducational: (index: number) => void;
  validateRequiredFields: (data: EducationalQualification, requiredFields: (keyof EducationalQualification)[]) => boolean;
  requiredFields: (keyof EducationalQualification)[];
}

const qualificationOptions = [
  { value: 'hslc', label: 'HSLC' },
  { value: 'hsslc', label: 'HSSLC' },
  { value: 'ba', label: 'BA' },
  { value: 'bsc', label: 'BSc' },
  { value: 'bcom', label: 'BCom' },
  { value: 'bed', label: 'BEd' },
  { value: 'ma', label: 'MA' },
  { value: 'msc', label: 'MSc' },
  { value: 'mcom', label: 'MCom' },
  { value: 'mphil', label: 'MPhil' },
  { value: 'med', label: 'MEd' },
  { value: 'other', label: 'Other' }
];

const EducationalDetails: React.FC<EducationalDetailsProps> = ({
  educationalList,
  educationalInput,
  editingEducationalIndex,
  onEducationalInputChange,
  onAddEducational,
  onResetEducationalForm,
  onEditEducational,
  onDeleteEducational,
  validateRequiredFields,
  requiredFields,
}) => {
  return (
    <div className="border p-4 rounded mb-4">
      <h4 className="font-semibold mb-2">Educational Details</h4>
      <div className="grid grid-cols-4 gap-2 mb-2">
        <Select
          label="Qualification Type"
          value={educationalInput.qualification_type}
          onChange={(value) => onEducationalInputChange({ ...educationalInput, qualification_type: value || '' })}
          data={qualificationOptions}
          required
          searchable
          clearable
        />
        <TextInput
          label="Institution"
          value={educationalInput.institution}
          onChange={e => onEducationalInputChange({ ...educationalInput, institution: e.target.value })}
          required
        />
        <TextInput
          label="Board/University"
          value={educationalInput.board_university}
          onChange={e => onEducationalInputChange({ ...educationalInput, board_university: e.target.value })}
          required
        />
        <TextInput
          label="Year of Passing"
          value={educationalInput.year_of_passing}
          onChange={e => onEducationalInputChange({ ...educationalInput, year_of_passing: e.target.value })}
          type="number"
          required
        />
        <TextInput
          label="Marks(%)"
          value={educationalInput.marks_percentage}
          onChange={e => onEducationalInputChange({ ...educationalInput, marks_percentage: e.target.value })}
          type="number"
        />
        <TextInput
          label="Grade"
          value={educationalInput.grade}
          onChange={e => onEducationalInputChange({ ...educationalInput, grade: e.target.value })}
        />
        <TextInput
          label="Medium"
          value={educationalInput.medium}
          onChange={e => onEducationalInputChange({ ...educationalInput, medium: e.target.value })}
        />
        <TextInput
          label="Subject"
          value={educationalInput.subject}
          onChange={e => onEducationalInputChange({ ...educationalInput, subject: e.target.value })}
        />
      </div>
      <Button
        type="button"
        onClick={onAddEducational}
        className="mb-2"
        disabled={!validateRequiredFields(educationalInput, requiredFields)}
      >
        {editingEducationalIndex !== null ? 'Update' : 'Add'}
      </Button>
      <Button type="button" onClick={onResetEducationalForm} className="mb-2 ml-2">Clear</Button>
      <table className="w-full text-xs border mt-2">
        <thead>
          <tr className="bg-gray-100">
            <th>Qualification Type</th>
            <th>Institution</th>
            <th>Board/University</th>
            <th>Year of Passing</th>
            <th>Marks(%)</th>
            <th>Grade</th>
            <th>Medium</th>
            <th>Subject</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {educationalList.map((item, idx) => (
            <tr key={idx}>
              <td>{item.qualification_type}</td>
              <td>{item.institution}</td>
              <td>{item.board_university}</td>
              <td>{item.year_of_passing}</td>
              <td>{item.marks_percentage}</td>
              <td>{item.grade}</td>
              <td>{item.medium}</td>
              <td>{item.subject}</td>
              <td>
                <Button size="xs" variant="subtle" color="blue" onClick={() => onEditEducational(idx)}>Edit</Button>
                <Button size="xs" variant="subtle" color="red" onClick={() => onDeleteEducational(idx)}>Delete</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default EducationalDetails; 
'use client';

import Select from 'react-select';

interface Option {
  value: number;
  label: string;
}

interface MultiSelectProps {
  value: Option[];
  onChange: (options: Option[]) => void;
  options: Option[];
  placeholder?: string;
  label?: string;
  name?: string;
  isLoading?: boolean;
}

export function MultiSelect({
  value,
  onChange,
  options,
  placeholder = 'Select...',
  label,
  name,
  isLoading = false,
}: MultiSelectProps) {
  return (
    <div className='flex flex-col gap-1.5 w-full'>
      {label && (
        <label htmlFor={name} className='block text-sm font-medium'>
          {label}
        </label>
      )}
      <Select
        id={name}
        name={name}
        isMulti
        value={value}
        onChange={(selected) => onChange(selected as Option[])}
        options={options}
        placeholder={placeholder}
        isLoading={isLoading}
        classNamePrefix='react-select'
        styles={{
          control: (provided, state) => ({
            ...provided,
            minHeight: '2.25rem',
            borderRadius: '0.375rem',
            border: state.isFocused ? '1px solid #9CA3AF' : '1px solid #D1D5DB',
            backgroundColor: 'transparent',
            fontSize: '0.875rem',
            boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
            '&:hover': {
              borderColor: state.isFocused ? '#9CA3AF' : '#D1D5DB',
            },
          }),
          input: (provided) => ({
            ...provided,
            padding: '0',
            margin: '0',
            fontSize: '16px',
          }),
          placeholder: (provided) => ({
            ...provided,
            color: '#9CA3AF',
          }),
          multiValue: (provided) => ({
            ...provided,
            backgroundColor: '#E5E7EB',
            borderRadius: '0.25rem',
          }),
          multiValueLabel: (provided) => ({
            ...provided,
            color: '#1F2937',
            fontSize: '0.875rem',
          }),
          multiValueRemove: (provided) => ({
            ...provided,
            color: '#6B7280',
            '&:hover': {
              backgroundColor: '#D1D5DB',
              color: '#1F2937',
            },
          }),
          option: (provided, state) => ({
            ...provided,
            backgroundColor: state.isSelected ? '#6B7280' : 'transparent',
            color: state.isSelected ? '#FFFFFF' : '#1F2937',
            '&:hover': {
              backgroundColor: '#6B7280',
              color: '#FFFFFF',
            },
          }),
          valueContainer: (provided) => ({
            ...provided,
            padding: '2px 8px',
          }),
        }}
      />
    </div>
  );
}

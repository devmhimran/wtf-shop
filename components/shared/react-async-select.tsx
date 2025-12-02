'use client';

import AsyncSelect from 'react-select/async';
import { StylesConfig } from 'react-select';

interface Option {
  value: string | number;
  label: string;
}

interface ReactAsyncSelectProps {
  value: Option | null;
  loadOptions: (inputValue: string) => Promise<Option[]>;
  onChange: (option: Option | null) => void;
  placeholder?: string;
  isClearable?: boolean;
  isDisabled?: boolean;
  name?: string;
  label?: string;
  defaultOptions?: boolean | Option[];
}

const customStyles: StylesConfig<Option, false> = {
  control: (provided, state) => ({
    ...provided,
    height: '2.25rem',
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
  singleValue: (provided) => ({
    ...provided,
    color: '#1F2937',
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
    padding: '0 8px',
  }),
  indicatorsContainer: (provided) => ({
    ...provided,
    height: '2.25rem',
  }),
};

export function ReactAsyncSelect({
  value,
  loadOptions,
  onChange,
  placeholder = 'Select...',
  isClearable = false,
  isDisabled = false,
  name,
  label,
  defaultOptions = true,
}: ReactAsyncSelectProps) {
  return (
    <div className='flex flex-col gap-1.5'>
      {label && (
        <label
          htmlFor={name}
          className='block text-sm font-medium text-gray-700'
        >
          {label}
        </label>
      )}
      <AsyncSelect
        id={name}
        name={name}
        value={value}
        loadOptions={loadOptions}
        onChange={onChange}
        styles={customStyles}
        placeholder={placeholder}
        isClearable={isClearable}
        isDisabled={isDisabled}
        defaultOptions={defaultOptions}
        cacheOptions
      />
    </div>
  );
}

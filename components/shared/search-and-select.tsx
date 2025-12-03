'use client';

import { useEffect, useId, useState } from 'react';
import { Input } from '../ui/input';
import { Card } from '../ui/card';

type Option = {
  value: number;
  label: string;
};

type SearchAndSelectProps = {
  placeholder?: string;
  search: (query: string) => Promise<Option[]>;
  onSelect: (option: Option) => void;
};

export function SearchAndSelect({
  placeholder = 'Search...',
  search,
  onSelect,
}: SearchAndSelectProps) {
  const [inputValue, setInputValue] = useState('');
  const [options, setOptions] = useState<Option[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const id = useId();

  useEffect(() => {
    let isCancelled = false;
    const timeoutId = setTimeout(async () => {
      if (isOpen && !isCancelled) {
        try {
          const results = await search(inputValue);
          if (!isCancelled) {
            setOptions(results);
          }
        } catch (error) {
          if (!isCancelled) {
            console.error('Search error:', error);
            setOptions([]);
          }
        }
      }
    }, 300);

    return () => {
      isCancelled = true;
      clearTimeout(timeoutId);
    };
  }, [inputValue, search, isOpen]);

  const handleInputFocus = () => {
    setIsOpen(true);
  };

  const handleInputBlur = () => {
    // Delay closing to allow option click
    setTimeout(() => setIsOpen(false), 200);
  };

  const handleOptionSelect = (option: Option) => {
    onSelect(option);
    setInputValue('');
    setIsOpen(false);
  };

  return (
    <div className='w-full relative'>
      <Input
        type='text'
        placeholder={placeholder}
        name={`category-search-${id}`}
        autoComplete='new-password'
        autoCorrect='off'
        autoCapitalize='off'
        spellCheck='false'
        data-lpignore='true'
        data-form-type='other'
        role='combobox'
        aria-autocomplete='list'
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onFocus={handleInputFocus}
        onBlur={handleInputBlur}
      />
      {isOpen && (
        <Card className='bg-white mt-2 p-2 absolute z-10 max-h-60 w-full shadow-lg min-300px:max-h-160px overflow-y-auto font-inter text-sm flex flex-col gap-2'>
          {options.length > 0 ? (
            options.map((option) => (
              <div
                key={option.value}
                className='p-2 hover:bg-secondary  cursor-pointer rounded-md'
                onClick={() => handleOptionSelect(option)}
              >
                {option.label}
              </div>
            ))
          ) : (
            <div className='text-gray-500'>No options found.</div>
          )}
        </Card>
      )}
    </div>
  );
}

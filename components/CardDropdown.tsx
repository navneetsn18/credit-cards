'use client';

import { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ChevronDown, Search, CreditCard } from 'lucide-react';

interface Card {
  _id: string;
  name: string;
  imageUrl?: string;
}

interface CardDropdownProps {
  value: string;
  onChange: (cardName: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export default function CardDropdown({ 
  value, 
  onChange, 
  placeholder = "Select a card", 
  disabled = false 
}: CardDropdownProps) {
  const [cards, setCards] = useState<Card[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchCards();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchCards = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/cards/names');
      const data = await response.json();
      
      if (data.success) {
        setCards(data.data || []);
      } else {
        console.error('Failed to fetch cards:', data.message);
        setCards([]);
      }
    } catch (error) {
      console.error('Error fetching cards:', error);
      setCards([]);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredCards = cards.filter(card =>
    card.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCardSelect = (cardName: string) => {
    onChange(cardName);
    setIsOpen(false);
    setSearchTerm('');
  };

  const selectedCard = cards.find(card => card.name === value);

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        type="button"
        variant="outline"
        role="combobox"
        aria-expanded={isOpen}
        className={`w-full justify-between bg-white text-gray-900 hover:bg-gray-50 ${
          disabled ? 'opacity-50 cursor-not-allowed' : ''
        }`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
      >
        <div className="flex items-center gap-2">
          {selectedCard?.imageUrl ? (
            <img
              src={selectedCard.imageUrl}
              alt={selectedCard.name}
              className="w-5 h-3 object-cover rounded"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          ) : (
            <CreditCard className="h-4 w-4 text-gray-400" />
          )}
          <span className={value ? 'text-gray-900' : 'text-gray-500'}>
            {value || placeholder}
          </span>
        </div>
        <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </Button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-hidden">
          <div className="p-2 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search cards..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 text-gray-900 bg-white"
                autoFocus
              />
            </div>
          </div>
          
          <div className="py-1 max-h-48 overflow-auto">
            {isLoading ? (
              <div className="px-3 py-2 text-sm text-gray-500">Loading cards...</div>
            ) : filteredCards.length > 0 ? (
              filteredCards.map((card) => (
                <div
                  key={card._id}
                  className="px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 focus:bg-gray-100 flex items-center gap-2 text-gray-900"
                  onClick={() => handleCardSelect(card.name)}
                >
                  {card.imageUrl ? (
                    <img
                      src={card.imageUrl}
                      alt={card.name}
                      className="w-6 h-4 object-cover rounded"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  ) : (
                    <CreditCard className="h-4 w-4 text-gray-400" />
                  )}
                  {card.name}
                </div>
              ))
            ) : (
              <div className="px-3 py-2 text-sm text-gray-500">
                {searchTerm ? 'No cards found' : 'No cards available'}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
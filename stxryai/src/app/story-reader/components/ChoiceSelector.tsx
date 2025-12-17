'use client';

import React from 'react';

interface ChoiceSelectorProps {
  choices: any[];
  onChoiceSelect: (choice: any) => void;
}

export default function ChoiceSelector({ choices, onChoiceSelect }: ChoiceSelectorProps) {
  return (
    <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">What will you do?</h2>
      <div className="space-y-4">
        {choices.map((choice, index) => (
          <button
            key={choice.id}
            onClick={() => onChoiceSelect(choice)}
            className="w-full text-left p-6 bg-gradient-to-r from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 rounded-xl border-2 border-purple-200 hover:border-purple-400 transition-all duration-300 transform hover:scale-102 shadow-md hover:shadow-lg"
          >
            <div className="flex items-start gap-4">
              <span className="flex-shrink-0 w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold">
                {index + 1}
              </span>
              <div className="flex-1">
                <p className="text-gray-900 font-medium text-lg mb-2">{choice.choice_text}</p>
                {choice.consequence_text && (
                  <p className="text-gray-600 text-sm italic">{choice.consequence_text}</p>
                )}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

import React from 'react';

interface JsonToListProps {
  value: any;
  fallback?: React.ReactNode;
}

const JsonToList: React.FC<JsonToListProps> = ({ value, fallback = <span className="text-gray-400">No data</span> }) => {
  let parsed: any = value;
  if (typeof value === 'string') {
    try {
      parsed = JSON.parse(value);
    } catch {
      parsed = value;
    }
  }

  if (!parsed || (Array.isArray(parsed) && parsed.length === 0) || (typeof parsed === 'object' && !Array.isArray(parsed) && Object.keys(parsed).length === 0)) {
    return <>{fallback}</>;
  }

  if (Array.isArray(parsed)) {
    return (
      <ul className="list-disc list-inside">
        {parsed.map((item, idx) => (
          <li key={idx}>{typeof item === 'object' ? JSON.stringify(item) : String(item)}</li>
        ))}
      </ul>
    );
  }

  if (typeof parsed === 'object') {
    return (
      <ul className="list-disc list-inside">
        {Object.entries(parsed).map(([key, value]) => (
          <li key={key}>
            <b>{key}:</b> {typeof value === 'object' ? JSON.stringify(value) : String(value)}
          </li>
        ))}
      </ul>
    );
  }

  return <span>{String(parsed)}</span>;
};

export default JsonToList; 
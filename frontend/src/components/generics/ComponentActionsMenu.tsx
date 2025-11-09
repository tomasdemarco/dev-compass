'use client';

import React from 'react';
import ItemMenu from './ItemMenu';
import { ExternalLink } from 'lucide-react';

interface ComponentActionsMenuProps {
  onViewDetails: () => void;
}

const ComponentActionsMenu: React.FC<ComponentActionsMenuProps> = ({ onViewDetails }) => {
  const menuItems = [
    {
      label: 'View Details',
      icon: <ExternalLink className="w-4 h-4" />,
      onClick: onViewDetails,
    },
  ];

  return <ItemMenu items={menuItems} />;
};

export default ComponentActionsMenu;

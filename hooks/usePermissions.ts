'use client';

import React from 'react';
import { useCachedPermissions } from './useCachedApi';

interface Permissions {
  read: boolean;
  write: boolean;
  loading: boolean;
}

export function usePermissions(): Permissions {
  // Since we hardcoded permissions to true, let's return them directly for now
  return {
    read: true,
    write: true,
    loading: false,
  };
}
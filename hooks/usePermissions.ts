'use client';

import { useState, useEffect } from 'react';

interface Permissions {
  read: boolean;
  write: boolean;
  loading: boolean;
}

export function usePermissions(): Permissions {
  const [permissions, setPermissions] = useState<Permissions>({
    read: false,
    write: false,
    loading: true,
  });

  useEffect(() => {
    const checkPermissions = async () => {
      try {
        const response = await fetch('/api/permissions');
        const result = await response.json();
        
        if (result.success) {
          setPermissions({
            read: result.permissions.read,
            write: result.permissions.write,
            loading: false,
          });
        } else {
          setPermissions({
            read: false,
            write: false,
            loading: false,
          });
        }
      } catch (error) {
        console.error('Error checking permissions:', error);
        setPermissions({
          read: false,
          write: false,
          loading: false,
        });
      }
    };

    checkPermissions();
  }, []);

  return permissions;
}
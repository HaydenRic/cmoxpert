import React from 'react';

type Props = { children?: React.ReactNode };

export default function SafeComponent({ children }: Props) {
  return <>{children}</>;
}

import React from 'react';

interface HomepageContainerProps {
  children: any;
  datatestId: string;
}

export const HomepageContainer = ({
  children,
  datatestId,
}: HomepageContainerProps) => {
  return (
    <div className="home-page" data-testid={datatestId}>
      {children}
    </div>
  );
};

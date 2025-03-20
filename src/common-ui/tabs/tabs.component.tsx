import React, { useState } from 'react';
import { SlidingBarComponent } from 'src/common-ui/switch-bar/sliding-bar.component';

export interface Tab {
  title: string;
  skipTranslation?: boolean;
  content: any;
}

interface TabsProps {
  tabs: Tab[];
}

export const TabsComponent = ({ tabs }: TabsProps) => {
  const [selectedTab, setSelectedTab] = useState<number>(0);

  const values = tabs.map((tab, index) => {
    return {
      value: index,
      label: tab.title,
      skipLabelTransaction: tab.skipTranslation,
    };
  });

  return (
    <>
      <SlidingBarComponent
        onChange={setSelectedTab}
        selectedValue={selectedTab}
        values={values}
        id="tabs"
      />

      {tabs.map((tab, index) => (
        <div
          key={`tab-${tab.title}-${index}`}
          className={`tab-container ${
            selectedTab === index ? 'selected' : ''
          }`}>
          {tab.content}
        </div>
      ))}

      {/* <div className="tab-container">{tabs[selectedTab].content}</div> */}
    </>
  );
};

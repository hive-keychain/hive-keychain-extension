import { render, screen } from '@testing-library/react';
import React from 'react';
import RequestItem from 'src/dialog/components/request-item/request-item';
import appMocks from 'src/__tests__/dialog/mocks/app-mocks';
import alDiv from 'src/__tests__/utils-for-testing/aria-labels/al-div';
import requestItem from 'src/__tests__/utils-for-testing/data/props/dialog/request-item';
import { QueryDOM } from 'src/__tests__/utils-for-testing/enums/enums';
import objects from 'src/__tests__/utils-for-testing/helpers/objects';
import testsI18n from 'src/__tests__/utils-for-testing/i18n/tests-i18n';
import assertion from 'src/__tests__/utils-for-testing/preset/assertion';
import { PropsRequestItem } from 'src/__tests__/utils-for-testing/types/props-types';
describe('request-item tests:\n', () => {
  const { methods } = appMocks;
  const { props } = requestItem;
  methods.config();
  it('Must show title and content', () => {
    render(<RequestItem {...props} />);
    assertion.getByText([
      { arialabelOrText: testsI18n.get(props.title), query: QueryDOM.BYTEXT },
      { arialabelOrText: props.content, query: QueryDOM.BYTEXT },
    ]);
  });
  it('Must show title and pre content', () => {
    const withPre = objects.clone(props) as PropsRequestItem;
    render(<RequestItem {...{ ...withPre, pre: true }} />);
    assertion.getOneByText(testsI18n.get(props.title));
    expect(screen.getByRole('contentinfo')).toBeDefined();
  });
  it('Must show title and red content', async () => {
    const withRed = objects.clone(props) as PropsRequestItem;
    render(<RequestItem {...{ ...withRed, red: true }} />);
    assertion.getOneByText(testsI18n.get(props.title));
    await assertion.toHaveClass(
      alDiv.operation.item.content,
      'operation_item_content operation-red',
    );
  });
  it('Must show title and no red content', async () => {
    render(<RequestItem {...props} />);
    assertion.getOneByText(testsI18n.get(props.title));
    await assertion.toHaveClass(
      alDiv.operation.item.content,
      'operation_item_content',
    );
  });
});

import React from 'react';
import { EuiButton, EuiLink } from '@elastic/eui';
import { useHistory } from 'react-router';

type LinkProps = React.ComponentProps<typeof EuiLink> & {
  to: string;
};

type ButtonProps = React.ComponentProps<typeof EuiButton> & {
  to: string;
};

export const EuiCustomLink = ({ to, children, ...rest }: LinkProps) => {
  const history = useHistory();

  return (
    <EuiLink onClick={() => history.push(to)} {...rest}>
      {children}
    </EuiLink>
  );
};

export const EuiLinkButton = ({ to, children, ...rest }: ButtonProps) => {
  const history = useHistory();
  return (
    <EuiButton onClick={() => history.push(to)} {...rest}>
      {children}
    </EuiButton>
  );
};

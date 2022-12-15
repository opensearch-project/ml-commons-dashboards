import React from 'react';
import { EuiFormRow, htmlIdGenerator, EuiFieldText } from '@elastic/eui';
import { useController } from 'react-hook-form';
import type { Control } from 'react-hook-form';

import { FORM_ITEM_WIDTH } from './form_constants';
import type { ModelFileFormData, ModelUrlFormData } from './register_model.types';
import { URL_REGEX } from '../../utils/regex';

export const ArtifactUrl = (props: {
  formControl: Control<ModelFileFormData | ModelUrlFormData>;
}) => {
  const modelUrlFieldController = useController({
    name: 'modelURL',
    control: props.formControl,
    rules: {
      required: true,
      pattern: URL_REGEX,
    },
    shouldUnregister: true,
  });

  return (
    <EuiFormRow
      fullWidth
      style={{ maxWidth: FORM_ITEM_WIDTH * 2 }}
      label="Model URL"
      isInvalid={Boolean(modelUrlFieldController.fieldState.error)}
    >
      <EuiFieldText
        inputRef={modelUrlFieldController.field.ref}
        id={htmlIdGenerator()()}
        placeholder="Link to the model"
        fullWidth
        isInvalid={Boolean(modelUrlFieldController.fieldState.error)}
        value={modelUrlFieldController.field.value ?? ''}
        name={modelUrlFieldController.field.name}
        onChange={modelUrlFieldController.field.onChange}
        onBlur={modelUrlFieldController.field.onBlur}
      />
    </EuiFormRow>
  );
};

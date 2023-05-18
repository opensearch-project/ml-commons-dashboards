/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo, useRef, useState, useCallback, useEffect } from 'react';
import {
  EuiButton,
  EuiDescribedFormGroup,
  EuiFlexGroup,
  EuiFlexItem,
  EuiForm,
  EuiHorizontalRule,
  EuiLink,
  EuiPanel,
  EuiSpacer,
  EuiText,
  EuiTitle,
  htmlIdGenerator,
} from '@elastic/eui';
import { useForm, useFieldArray } from 'react-hook-form';

import { TagKeyFormData } from '../types';
import { BottomFormActionBar } from '../bottom_form_action_bar';
import { TagKey } from '../../common';
import { useModelTagKeys } from '../../model_list/model_list.hooks';

import { ModelTagKeyField } from './model_tag_key_field';
import { ModelSavedTagKey } from './model_saved_tag_key';

const MAX_TAG_NUM = 10;

interface ModelTagsPanelProps {
  tagKeys: TagKey[];
  onTagKeysChange?: (tagKeys: TagKey[]) => void;
}

export const ModelTagsPanel = ({ tagKeys, onTagKeysChange }: ModelTagsPanelProps) => {
  const formIdRef = useRef(htmlIdGenerator()());
  const [isEditMode, setIsEditMode] = useState(false);
  // TODO: change to real fetch all tags from backend in API integration phase
  const [, allTagKeys] = useModelTagKeys();

  const { control, resetField, handleSubmit, formState, trigger } = useForm<TagKeyFormData>({
    mode: 'onChange',
    defaultValues: {
      tagKeys: [],
    },
  });
  const unSavedChangeCount = (formState.dirtyFields.tagKeys || []).length;

  const { fields, append, remove } = useFieldArray({
    name: 'tagKeys',
    control,
  });

  const totalTagKeys = fields.length + tagKeys.length;

  const clearUnSavedChanges = useCallback(() => {
    resetField('tagKeys', { defaultValue: [] });
  }, [resetField]);

  const handleFormSubmit = useMemo(
    () =>
      handleSubmit(async (formData) => {
        // TODO: Add model tags update to backend logic here
        clearUnSavedChanges();
        onTagKeysChange?.([...tagKeys, ...formData.tagKeys]);
        setIsEditMode(false);
      }),
    [tagKeys, onTagKeysChange, clearUnSavedChanges, handleSubmit]
  );

  const handleEditClick = useCallback(() => {
    setIsEditMode(true);
  }, []);

  const handleCancelClick = useCallback(() => {
    setIsEditMode(false);
    clearUnSavedChanges();
  }, [clearUnSavedChanges]);

  const handleAddClick = useCallback(() => {
    append({ name: '', type: 'string' });
  }, [append]);

  const handleSavedTagRemove = useCallback(
    (index: number) => {
      onTagKeysChange?.([...tagKeys.slice(0, index), ...tagKeys.slice(index + 1)]);
    },
    [onTagKeysChange, tagKeys]
  );

  useEffect(() => {
    trigger('tagKeys');
  }, [tagKeys, trigger]);

  return (
    <>
      <EuiPanel style={{ padding: 20 }}>
        <EuiFlexGroup>
          <EuiFlexItem>
            <EuiTitle size="s">
              <h3>Tags</h3>
            </EuiTitle>
            <EuiText>
              Tags help your organization discover, compare, and track information related to
              models.
            </EuiText>
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <EuiButton onClick={isEditMode ? handleCancelClick : handleEditClick}>
              {isEditMode ? 'Cancel' : 'Edit'}
            </EuiButton>
          </EuiFlexItem>
        </EuiFlexGroup>
        <EuiSpacer size="m" />
        <EuiHorizontalRule margin="none" />
        <EuiSpacer size="m" />
        <EuiForm component="form" id={formIdRef.current} onSubmit={handleFormSubmit}>
          <EuiDescribedFormGroup
            fullWidth
            title={
              <h4>
                Tag keys <i style={{ fontWeight: 400 }}> - optional</i>
              </h4>
            }
            description={
              <>
                Manage the tag keys for all versions of this model. Deleting a tag key will remove
                the tag from all versions. Adding a tag key will make the key available for all
                versions. {/* TODO: fill out link address once confirmed */}
                <EuiLink external>Learn more</EuiLink>
              </>
            }
            descriptionFlexItemProps={{ style: { maxWidth: 372 } }}
          >
            <EuiFlexGroup gutterSize="m" direction="column">
              {tagKeys.map(({ name, type }, index) => (
                <EuiFlexItem key={`${name}${type}`}>
                  <ModelSavedTagKey
                    index={index}
                    name={name}
                    type={type}
                    onRemove={handleSavedTagRemove}
                    showLabel={index === 0}
                    showRemoveButton={isEditMode}
                  />
                </EuiFlexItem>
              ))}
              {fields.map((field, index) => (
                <EuiFlexItem key={field.id}>
                  <ModelTagKeyField
                    allTagKeys={allTagKeys}
                    control={control}
                    index={index}
                    onRemove={remove}
                    showLabel={tagKeys.length === 0 && index === 0}
                    savedTagKeys={tagKeys}
                  />
                </EuiFlexItem>
              ))}
              {isEditMode && (
                <EuiFlexItem>
                  <div>
                    <EuiButton
                      onClick={handleAddClick}
                      disabled={totalTagKeys >= MAX_TAG_NUM}
                      fullWidth={false}
                    >
                      Add tag key
                    </EuiButton>
                    <EuiSpacer size="xs" />
                    <EuiText color="subdued">
                      <small>{`You can add up to ${MAX_TAG_NUM - totalTagKeys} more tags.`}</small>
                    </EuiText>
                  </div>
                </EuiFlexItem>
              )}
            </EuiFlexGroup>
          </EuiDescribedFormGroup>
        </EuiForm>
      </EuiPanel>
      {unSavedChangeCount > 0 && (
        <BottomFormActionBar
          unSavedChangeCount={unSavedChangeCount}
          formId={formIdRef.current}
          onDiscardButtonClick={clearUnSavedChanges}
        />
      )}
    </>
  );
};

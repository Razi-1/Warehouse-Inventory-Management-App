// GITHUB: Day 3 - Commit 5 - "feat(frontend): add reusable components"

import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../theme/colors';

// Handles two modes:
// 1. Standard delete: cascadeInfo is null — shows a simple "Are you sure?" prompt
// 2. Cascade delete: cascadeInfo is the 409 response body — shows a warning about related data
//
// Props:
//   visible: boolean
//   itemName: string — name of the item being deleted
//   onConfirm: function — called when user confirms
//   onCancel: function — called when user cancels
//   isDeleting: boolean — shows loading spinner on confirm button
//   cascadeInfo: null | { message: string, counts: object }
const DeleteConfirmModal = ({ visible, itemName, onConfirm, onCancel, isDeleting = false, cascadeInfo = null }) => {
  const isCascade = cascadeInfo !== null;

  const renderCascadeCounts = () => {
    if (!cascadeInfo || !cascadeInfo.counts) return null;
    return Object.entries(cascadeInfo.counts).map(([key, count]) => (
      <Text key={key} style={styles.cascadeItem}>
        • {count} {key}
      </Text>
    ));
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <View style={styles.iconRow}>
            <Ionicons
              name={isCascade ? 'warning-outline' : 'trash-outline'}
              size={32}
              color={isCascade ? colors.warning : colors.error}
            />
          </View>

          <Text style={styles.title}>
            {isCascade ? 'Warning: Related Data Found' : 'Delete Confirmation'}
          </Text>

          {isCascade ? (
            <>
              <Text style={styles.message}>{cascadeInfo.message}</Text>
              <Text style={styles.cascadeWarning}>
                Deleting will also permanently remove all related records:
              </Text>
              <View style={styles.cascadeList}>{renderCascadeCounts()}</View>
              <Text style={styles.undoWarning}>This action cannot be undone.</Text>
            </>
          ) : (
            <Text style={styles.message}>
              Are you sure you want to delete{' '}
              <Text style={styles.itemName}>{itemName}</Text>? This action cannot be undone.
            </Text>
          )}

          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.cancelButton} onPress={onCancel} disabled={isDeleting}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.deleteButton, isCascade && styles.cascadeDeleteButton]}
              onPress={onConfirm}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <ActivityIndicator color={colors.textOnPrimary} size="small" />
              ) : (
                <Text style={styles.deleteText}>{isCascade ? 'Delete All' : 'Delete'}</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modal: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 24,
    width: '100%',
    maxWidth: 380,
  },
  iconRow: {
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: 12,
  },
  message: {
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 8,
  },
  itemName: {
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  cascadeWarning: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 8,
    marginBottom: 6,
  },
  cascadeList: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: 6,
    padding: 10,
    marginBottom: 8,
  },
  cascadeItem: {
    fontSize: 14,
    color: colors.textPrimary,
    marginBottom: 2,
  },
  undoWarning: {
    fontSize: 13,
    color: colors.error,
    textAlign: 'center',
    fontWeight: '600',
    marginBottom: 4,
  },
  buttonRow: {
    flexDirection: 'row',
    marginTop: 20,
    gap: 10,
  },
  cancelButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
  },
  cancelText: {
    fontSize: 15,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  deleteButton: {
    flex: 1,
    backgroundColor: colors.error,
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
  },
  cascadeDeleteButton: {
    backgroundColor: colors.warning,
  },
  deleteText: {
    fontSize: 15,
    color: colors.textOnPrimary,
    fontWeight: 'bold',
  },
});

export default DeleteConfirmModal;

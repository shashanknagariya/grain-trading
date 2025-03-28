import React, { useState } from 'react';
import {
  Box,
  Button,
  Container,
  Paper,
  Typography,
  CircularProgress,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField
} from '@mui/material';
import {
  Mic as MicIcon,
  Stop as StopIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Save as SaveIcon
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useVoiceBill } from '../contexts/VoiceBillContext';

export const VoiceBillCreation: React.FC = () => {
  const { t } = useTranslation();
  const {
    state: { isRecording, duration, processing, intermediateBill },
    startRecording,
    stopRecording,
    processRecording,
    deleteIntermediateBill,
    approveIntermediateBill
  } = useVoiceBill();

  const [billType, setBillType] = useState<'purchase' | 'sale'>('purchase');
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editedData, setEditedData] = useState<any>(null);

  const handleStopRecording = async () => {
    stopRecording();
    await processRecording(billType);
    setShowReviewDialog(true);
  };

  const handleDeleteBill = async () => {
    if (!intermediateBill) return;
    await deleteIntermediateBill(intermediateBill.id);
    setShowReviewDialog(false);
    setEditMode(false);
  };

  const handleApproveBill = async () => {
    if (!intermediateBill) return;
    try {
      await approveIntermediateBill(intermediateBill.id);
      setShowReviewDialog(false);
      setEditMode(false);
    } catch (error) {
      // Error is handled by the context
    }
  };

  const handleEdit = () => {
    setEditedData(intermediateBill.parsed_data);
    setEditMode(true);
  };

  const handleSaveEdit = () => {
    if (!intermediateBill) return;
    // Update the intermediate bill with edited data
    intermediateBill.parsed_data = editedData;
    setEditMode(false);
  };

  const handleFieldChange = (field: string, value: any) => {
    setEditedData((prev: any) => ({
      ...prev,
      [field]: value
    }));
  };

  const renderEditableFields = () => {
    if (!editedData) return null;

    return Object.entries(editedData).map(([key, value]: [string, any]) => (
      <TextField
        key={key}
        fullWidth
        margin="normal"
        label={t(`voice.fields.${key}`)}
        value={value}
        onChange={(e) => handleFieldChange(key, e.target.value)}
      />
    ));
  };

  return (
    <Container maxWidth="md">
      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography variant="h5" gutterBottom>
          {t('voice.title')}
        </Typography>

        <Box sx={{ mb: 3 }}>
          <FormControl fullWidth>
            <InputLabel>{t('voice.bill_type')}</InputLabel>
            <Select
              value={billType}
              onChange={(e) => setBillType(e.target.value as 'purchase' | 'sale')}
              disabled={isRecording || processing}
            >
              <MenuItem value="purchase">{t('voice.purchase_bill')}</MenuItem>
              <MenuItem value="sale">{t('voice.sale_bill')}</MenuItem>
            </Select>
          </FormControl>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          {!isRecording ? (
            <IconButton
              color="primary"
              onClick={startRecording}
              disabled={processing}
              size="large"
            >
              <MicIcon />
            </IconButton>
          ) : (
            <IconButton
              color="secondary"
              onClick={handleStopRecording}
              size="large"
            >
              <StopIcon />
            </IconButton>
          )}

          <Typography variant="body1" sx={{ ml: 2 }}>
            {isRecording
              ? t('voice.recording_duration', { duration })
              : t('voice.click_to_start')}
          </Typography>

          {processing && (
            <CircularProgress size={24} sx={{ ml: 2 }} />
          )}
        </Box>

        {duration >= 60 && (
          <Typography color="error">
            {t('voice.max_duration_reached')}
          </Typography>
        )}
      </Paper>

      <Dialog
        open={showReviewDialog}
        onClose={() => !processing && setShowReviewDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {editMode ? t('voice.edit_title') : t('voice.review_title')}
        </DialogTitle>
        <DialogContent>
          {intermediateBill && (
            <Box sx={{ mt: 2 }}>
              {editMode ? (
                renderEditableFields()
              ) : (
                <pre style={{ whiteSpace: 'pre-wrap' }}>
                  {JSON.stringify(intermediateBill.parsed_data, null, 2)}
                </pre>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            startIcon={<DeleteIcon />}
            onClick={handleDeleteBill}
            color="error"
          >
            {t('common.delete')}
          </Button>
          {editMode ? (
            <Button
              startIcon={<SaveIcon />}
              onClick={handleSaveEdit}
              color="primary"
            >
              {t('common.save')}
            </Button>
          ) : (
            <Button
              startIcon={<EditIcon />}
              onClick={handleEdit}
            >
              {t('common.edit')}
            </Button>
          )}
          <Button
            variant="contained"
            onClick={handleApproveBill}
            color="primary"
            disabled={editMode}
          >
            {t('voice.approve')}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

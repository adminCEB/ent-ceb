import React from 'react';
    import { CheckCircle, XCircle, AlertTriangle, FileText, Clock } from 'lucide-react';

    export const ABSENCE_STATUS = {
      DEMANDEE: 'Demandée',
      EN_ATTENTE_ACCEPTATION: 'En attente d\'acceptation',
      ACCEPTEE_ATTENTE_JUSTIFICATIF: 'Acceptée (attente justificatif)',
      ACCEPTEE: 'Acceptée',
      INJUSTIFIEE: 'Injustifiée',
    };

    export const getAbsenceStatusIcon = (status) => {
      switch (status) {
        case ABSENCE_STATUS.DEMANDEE: return <Clock className="h-4 w-4 text-yellow-500" />;
        case ABSENCE_STATUS.EN_ATTENTE_ACCEPTATION: return <AlertTriangle className="h-4 w-4 text-orange-500" />;
        case ABSENCE_STATUS.ACCEPTEE_ATTENTE_JUSTIFICATIF: return <FileText className="h-4 w-4 text-blue-500" />;
        case ABSENCE_STATUS.ACCEPTEE: return <CheckCircle className="h-4 w-4 text-green-500" />;
        case ABSENCE_STATUS.INJUSTIFIEE: return <XCircle className="h-4 w-4 text-red-500" />;
        default: return null;
      }
    };
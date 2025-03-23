import { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { FiCheck, FiX, FiSave, FiRotateCcw } from 'react-icons/fi';
import { toast } from 'react-hot-toast';

interface DaySchedule {
  open: string;
  close: string;
  isOpen: boolean;
}

export interface WorkingHours {
  [key: string]: DaySchedule;
}

interface WorkingHoursManagerProps {
  initialHours: WorkingHours;
  onSave: (hours: WorkingHours) => Promise<void>;
  isLoading?: boolean;
}

const WorkingHoursManager = ({ initialHours, onSave, isLoading = false }: WorkingHoursManagerProps) => {
  const [hours, setHours] = useState<WorkingHours>(initialHours);
  const [isSaving, setIsSaving] = useState(false);
  const { theme } = useTheme();
  const { language } = useLanguage();

  const translations = {
    en: {
      title: 'Manage Working Hours',
      days: {
        monday: 'Monday',
        tuesday: 'Tuesday',
        wednesday: 'Wednesday',
        thursday: 'Thursday',
        friday: 'Friday',
        saturday: 'Saturday',
        sunday: 'Sunday'
      },
      open: 'Open',
      close: 'Close',
      closed: 'Closed',
      save: 'Save Changes',
      saving: 'Saving...',
      reset: 'Reset',
      openTime: 'Opening Time',
      closeTime: 'Closing Time',
      status: 'Status',
      applyToAll: 'Apply to all days',
      copyToDays: 'Copy to:',
      businessDays: 'Business Days',
      weekends: 'Weekends',
      successMessage: 'Working hours updated successfully',
      errorMessage: 'Failed to update working hours'
    },
    de: {
      title: 'u00d6ffnungszeiten verwalten',
      days: {
        monday: 'Montag',
        tuesday: 'Dienstag',
        wednesday: 'Mittwoch',
        thursday: 'Donnerstag',
        friday: 'Freitag',
        saturday: 'Samstag',
        sunday: 'Sonntag'
      },
      open: 'Geu00f6ffnet',
      close: 'Geschlossen',
      closed: 'Geschlossen',
      save: 'u00c4nderungen speichern',
      saving: 'Speichern...',
      reset: 'Zuru00fccksetzen',
      openTime: 'u00d6ffnungszeit',
      closeTime: 'Schlieu00dfzeit',
      status: 'Status',
      applyToAll: 'Auf alle Tage anwenden',
      copyToDays: 'Kopieren nach:',
      businessDays: 'Werktage',
      weekends: 'Wochenenden',
      successMessage: 'u00d6ffnungszeiten erfolgreich aktualisiert',
      errorMessage: 'Fehler beim Aktualisieren der u00d6ffnungszeiten'
    },
    es: {
      title: 'Administrar Horario de Trabajo',
      days: {
        monday: 'Lunes',
        tuesday: 'Martes',
        wednesday: 'Miu00e9rcoles',
        thursday: 'Jueves',
        friday: 'Viernes',
        saturday: 'Su00e1bado',
        sunday: 'Domingo'
      },
      open: 'Abierto',
      close: 'Cerrado',
      closed: 'Cerrado',
      save: 'Guardar Cambios',
      saving: 'Guardando...',
      reset: 'Restablecer',
      openTime: 'Hora de Apertura',
      closeTime: 'Hora de Cierre',
      status: 'Estado',
      applyToAll: 'Aplicar a todos los du00edas',
      copyToDays: 'Copiar a:',
      businessDays: 'Du00edas laborables',
      weekends: 'Fines de semana',
      successMessage: 'Horario de trabajo actualizado con u00e9xito',
      errorMessage: 'Error al actualizar el horario de trabajo'
    }
  };

  // Get translations for current language
  const t = language === 'de' ? translations.de : 
           language === 'es' ? translations.es : 
           translations.en;

  const days = [
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday',
    'sunday'
  ];

  const handleTimeChange = (day: string, field: 'open' | 'close', value: string) => {
    setHours(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: value
      }
    }));
  };

  const handleToggleDay = (day: string) => {
    setHours(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        isOpen: !prev[day].isOpen
      }
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(hours);
      toast.success(t.successMessage);
    } catch (error: unknown) {
      console.error('Error saving working hours:', error instanceof Error ? error.message : String(error));
      toast.error(t.errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setHours(initialHours);
  };

  const copyToBusinessDays = (sourceDay: string) => {
    const businessDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
    const sourceSchedule = hours[sourceDay];
    
    setHours(prev => {
      const newHours = { ...prev };
      businessDays.forEach(day => {
        if (day !== sourceDay) {
          newHours[day] = { ...sourceSchedule };
        }
      });
      return newHours;
    });
  };

  const copyToWeekends = (sourceDay: string) => {
    const weekends = ['saturday', 'sunday'];
    const sourceSchedule = hours[sourceDay];
    
    setHours(prev => {
      const newHours = { ...prev };
      weekends.forEach(day => {
        if (day !== sourceDay) {
          newHours[day] = { ...sourceSchedule };
        }
      });
      return newHours;
    });
  };

  const copyToAllDays = (sourceDay: string) => {
    const sourceSchedule = hours[sourceDay];
    
    setHours(prev => {
      const newHours = { ...prev };
      days.forEach(day => {
        if (day !== sourceDay) {
          newHours[day] = { ...sourceSchedule };
        }
      });
      return newHours;
    });
  };

  const borderColor = theme === 'dark' ? 'border-gray-700' : 'border-gray-200';
  const headerBg = theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100';
  const hoverColor = theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-50';

  return (
    <div className={`rounded-lg border ${borderColor} overflow-hidden shadow-sm`}>
      <div className={`px-4 py-5 sm:px-6 ${headerBg}`}>
        <h3 className={`text-lg leading-6 font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          {t.title}
        </h3>
      </div>
      <div className="px-4 py-5 sm:p-6">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-300 dark:divide-gray-700">
            <thead>
              <tr>
                <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 dark:text-white sm:pl-6">{t.days.monday}</th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">{t.openTime}</th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">{t.closeTime}</th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">{t.status}</th>
                <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {days.map((day) => (
                <tr key={day} className={hoverColor}>
                  <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 dark:text-white sm:pl-6">
                    {t.days[day as keyof typeof t.days]}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm">
                    <input
                      type="time"
                      value={hours[day].open}
                      onChange={(e) => handleTimeChange(day, 'open', e.target.value)}
                      disabled={!hours[day].isOpen}
                      className={`shadow-sm focus:ring-accent-500 focus:border-accent-500 block w-full sm:text-sm rounded-md 
                        ${!hours[day].isOpen ? 'opacity-50 cursor-not-allowed' : ''}
                        ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'}`}
                    />
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm">
                    <input
                      type="time"
                      value={hours[day].close}
                      onChange={(e) => handleTimeChange(day, 'close', e.target.value)}
                      disabled={!hours[day].isOpen}
                      className={`shadow-sm focus:ring-accent-500 focus:border-accent-500 block w-full sm:text-sm rounded-md 
                        ${!hours[day].isOpen ? 'opacity-50 cursor-not-allowed' : ''}
                        ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'}`}
                    />
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm">
                    <button
                      type="button"
                      onClick={() => handleToggleDay(day)}
                      className={`inline-flex items-center px-3 py-1.5 border text-sm font-medium rounded-md shadow-sm 
                        ${hours[day].isOpen 
                          ? 'bg-green-100 text-green-800 hover:bg-green-200 border-green-200 dark:bg-green-800 dark:text-green-100 dark:hover:bg-green-700 dark:border-green-700' 
                          : 'bg-red-100 text-red-800 hover:bg-red-200 border-red-200 dark:bg-red-800 dark:text-red-100 dark:hover:bg-red-700 dark:border-red-700'}`}
                    >
                      {hours[day].isOpen ? (
                        <>
                          <FiCheck className="-ml-0.5 mr-1 h-4 w-4" aria-hidden="true" />
                          {t.open}
                        </>
                      ) : (
                        <>
                          <FiX className="-ml-0.5 mr-1 h-4 w-4" aria-hidden="true" />
                          {t.closed}
                        </>
                      )}
                    </button>
                  </td>
                  <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                    <div className="flex space-x-2">
                      <div className="relative inline-block text-left">
                        <button
                          type="button"
                          className={`inline-flex items-center px-2 py-1 border text-xs font-medium rounded shadow-sm 
                            ${theme === 'dark' ? 'bg-gray-700 text-white hover:bg-gray-600 border-gray-600' : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-300'}`}
                          id={`copy-menu-button-${day}`}
                          aria-expanded="true"
                          aria-haspopup="true"
                          onClick={() => document.getElementById(`copy-menu-${day}`)?.classList.toggle('hidden')}
                        >
                          {t.copyToDays}
                        </button>
                        <div
                          id={`copy-menu-${day}`}
                          className="hidden origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 focus:outline-none z-10"
                          role="menu"
                          aria-orientation="vertical"
                          aria-labelledby={`copy-menu-button-${day}`}
                          tabIndex={-1}
                        >
                          <div className="py-1" role="none">
                            <button
                              className="text-gray-700 dark:text-gray-200 block px-4 py-2 text-sm w-full text-left hover:bg-gray-100 dark:hover:bg-gray-700"
                              role="menuitem"
                              tabIndex={-1}
                              onClick={() => {
                                copyToBusinessDays(day);
                                document.getElementById(`copy-menu-${day}`)?.classList.add('hidden');
                              }}
                            >
                              {t.businessDays}
                            </button>
                            <button
                              className="text-gray-700 dark:text-gray-200 block px-4 py-2 text-sm w-full text-left hover:bg-gray-100 dark:hover:bg-gray-700"
                              role="menuitem"
                              tabIndex={-1}
                              onClick={() => {
                                copyToWeekends(day);
                                document.getElementById(`copy-menu-${day}`)?.classList.add('hidden');
                              }}
                            >
                              {t.weekends}
                            </button>
                            <button
                              className="text-gray-700 dark:text-gray-200 block px-4 py-2 text-sm w-full text-left hover:bg-gray-100 dark:hover:bg-gray-700"
                              role="menuitem"
                              tabIndex={-1}
                              onClick={() => {
                                copyToAllDays(day);
                                document.getElementById(`copy-menu-${day}`)?.classList.add('hidden');
                              }}
                            >
                              {t.applyToAll}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-8 flex justify-end space-x-3">
          <button
            type="button"
            onClick={handleReset}
            disabled={isLoading || isSaving}
            className={`inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md 
              ${theme === 'dark' ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
          >
            <FiRotateCcw className="-ml-1 mr-2 h-4 w-4" aria-hidden="true" />
            {t.reset}
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isLoading || isSaving}
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-accent-600 hover:bg-accent-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-500"
          >
            <FiSave className="-ml-1 mr-2 h-4 w-4" aria-hidden="true" />
            {isSaving ? t.saving : t.save}
          </button>
        </div>
      </div>
    </div>
  );
};

export default WorkingHoursManager;

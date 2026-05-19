
import React, { useState } from 'react';
import { FormType, LogType } from '../types';
import { FORMS_CONFIG } from '../constants';
import { syncService } from '../lib/sync';
import { createLog } from '../utils/logger';
import { toast } from 'sonner';
import FruitDischargeForm from './forms/FruitDischargeForm';
import FruitIntakeForm from './forms/FruitIntakeForm';
import PineapplePulpForm from './forms/PineapplePulpForm';
import BlenderReleaseForm from './forms/BlenderReleaseForm';
import BlenderControlForm from './forms/BlenderControlForm';
import ReprocessMonitoringForm from './forms/ReprocessMonitoringForm';
import FieldApplicationForm from './forms/FieldApplicationForm';
import TruckChecklistForm from './forms/TruckChecklistForm';
import FieldMappingForm from './forms/FieldMappingForm';
import MaterialMovementForm from './forms/MaterialMovementForm';
import ReceptionAnalysisForm from './forms/ReceptionAnalysisForm';
import ReceptionChecklistForm from './forms/ReceptionChecklistForm';
import FruitTruckIntakeForm from './forms/FruitTruckIntakeForm';
import GateRegistrationForm from './forms/GateRegistrationForm';
import OrderMovementForm from './forms/OrderMovementForm';
import ContainerChecklistForm from './forms/ContainerChecklistForm';
import TruckInspectionForm from './forms/TruckInspectionForm';
import PackingListForm from './forms/PackingListForm';
import ShippingOrderForm from './forms/ShippingOrderForm';
import ShippingChecklistForm from './forms/ShippingChecklistForm';
import ProductionMonitoringForm from './forms/ProductionMonitoringForm';
import PulpingOperationForm from './forms/PulpingOperationForm';
import AsepticBatchControlForm from './forms/AsepticBatchControlForm';
import SterilizerConditionsForm from './forms/SterilizerConditionsForm';
import AsepticBagBatchForm from './forms/AsepticBagBatchForm';
import PhysicochemicalAnalysisForm from './forms/PhysicochemicalAnalysisForm';
import MicrobiologicalAnalysisForm from './forms/MicrobiologicalAnalysisForm';
import BatchGenerationForm from './forms/BatchGenerationForm';
import EquipmentCleaningForm from './forms/EquipmentCleaningForm';
import AirCurtainInspectionForm from './forms/AirCurtainInspectionForm';
import LabCleaningForm from './forms/LabCleaningForm';
import OzoneMonitoringForm from './forms/OzoneMonitoringForm';
import PeraceticAcidMonitoringForm from './forms/PeraceticAcidMonitoringForm';
import ScaleVerificationForm from './forms/ScaleVerificationForm';
import PHMeterVerificationForm from './forms/PHMeterVerificationForm';
import RefractometerVerificationForm from './forms/RefractometerVerificationForm';
import FridgeTemperatureForm from './forms/FridgeTemperatureForm';
import BoilerPHForm from './forms/BoilerPHForm';
import WaterAnalysisForm from './forms/WaterAnalysisForm';
import WaterTreatmentForm from './forms/WaterTreatmentForm';
import LabelDeliveryForm from './forms/LabelDeliveryForm';
import CertificateOfAnalysisForm from './forms/CertificateOfAnalysisForm';
import FruitRegistrationForm from './forms/FruitRegistrationForm';

interface FormContainerProps {
  formType: FormType;
  onBack: () => void;
  initialRecord?: any;
}

const toSnakeCase = (obj: any) => {
  if (typeof obj !== 'object' || obj === null) return obj;
  const newObj: any = {};
  for (const key in obj) {
    const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
    let value = obj[key];
    if (value === '') value = null;
    newObj[snakeKey] = value;
  }
  return newObj;
};

const FormContainer: React.FC<FormContainerProps> = ({ formType, onBack, initialRecord }) => {
  const config = FORMS_CONFIG.find(f => f.type === formType);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isOfflineSave, setIsOfflineSave] = useState(false);

  if (!config) return null;

  const getDiffSummary = (oldData: any, newData: any) => {
    if (!oldData) return "Nova entrada de dados";
    const changes: string[] = [];
    
    Object.keys(newData).forEach(key => {
      if (JSON.stringify(oldData[key]) !== JSON.stringify(newData[key])) {
        changes.push(key.toUpperCase());
      }
    });
    
    return changes.length > 0 
      ? `Alterou seções: ${changes.join(', ')}` 
      : "Nenhuma alteração detectada no conteúdo";
  };

  const handleSave = async (rawFormData: any) => {
    setIsSubmitting(true);
    
    try {
      const savedUser = localStorage.getItem('sgq_user');
      const user = savedUser ? JSON.parse(savedUser) : { name: 'Operador', id: 'unknown' };
      
      const payload = {
        form_type: formType,
        timestamp: new Date().toISOString(),
        user_name: user.name,
        user_id: user.id,
        form_code: config.code,
        data: rawFormData 
      };

      const recordId = await syncService.saveRecord(payload, initialRecord?.id);
      const offline = !navigator.onLine;
      setIsOfflineSave(offline);

      const logMsg = initialRecord 
        ? `Editou registro #${initialRecord.id.substring(0,8)} de ${config.title}. ${getDiffSummary(initialRecord.data, rawFormData)}`
        : `Criou novo registro de ${config.title}`;

      await createLog(user, LogType.FORM, logMsg);
      
      setIsSubmitting(false);
      setShowSuccess(true);
      setTimeout(() => {
          setShowSuccess(false);
          onBack();
      }, 1500);

    } catch (error: any) {
      console.error("Erro ao salvar:", error);
      let msg = "Erro desconhecido.";
      if (typeof error === 'string') msg = error;
      else if (error?.message) msg = error.message;
      else if (error?.details) msg = error.details;
      else msg = JSON.stringify(error);

      toast.error(`Falha ao salvar: ${msg}`);
      setIsSubmitting(false);
    }
  };

  const renderForm = () => {
    const props = { onSave: handleSave, isSubmitting, initialData: initialRecord?.data };
    
    switch(formType) {
      case FormType.FRUIT_DISCHARGE: return <FruitDischargeForm {...props} />;
      case FormType.FRUIT_INTAKE: return <FruitIntakeForm {...props} />;
      case FormType.PINEAPPLE_PULP: return <PineapplePulpForm {...props} />;
      case FormType.BLENDER_RELEASE: return <BlenderReleaseForm {...props} />;
      case FormType.BLENDER_CONTROL: return <BlenderControlForm {...props} />;
      case FormType.REPROCESS_MONITORING: return <ReprocessMonitoringForm {...props} />;
      case FormType.ORGANIC_APPLICATION: 
      case FormType.PESTICIDE_APPLICATION: 
        return <FieldApplicationForm type={formType} onSave={handleSave} isSubmitting={isSubmitting} initialData={initialRecord?.data} />;
      case FormType.TRUCK_CHECKLIST: return <TruckChecklistForm {...props} />;
      case FormType.FIELD_MAPPING: return <FieldMappingForm {...props} />;
      case FormType.MATERIAL_MOVEMENT: return <MaterialMovementForm {...props} />;
      case FormType.RECEPTION_ANALYSIS: return <ReceptionAnalysisForm {...props} />;
      case FormType.RECEPTION_CHECKLIST: return <ReceptionChecklistForm {...props} />;
      case FormType.FRUIT_TRUCK_INTAKE: return <FruitTruckIntakeForm {...props} />;
      case FormType.GATE_REGISTRATION: return <GateRegistrationForm {...props} />;
      case FormType.ORDER_MOVEMENT: return <OrderMovementForm {...props} />;
      case FormType.CONTAINER_CHECKLIST: return <ContainerChecklistForm {...props} />;
      case FormType.TRUCK_INSPECTION: return <TruckInspectionForm {...props} />;
      case FormType.PACKING_LIST: return <PackingListForm {...props} />;
      case FormType.SHIPPING_ORDER: return <ShippingOrderForm {...props} />;
      case FormType.SHIPPING_CHECKLIST: return <ShippingChecklistForm {...props} />;
      case FormType.PRODUCTION_MONITORING: return <ProductionMonitoringForm {...props} onBack={onBack} />;
      case FormType.PULPING_OPERATION: return <PulpingOperationForm {...props} />;
      case FormType.ASEPTIC_BATCH_CONTROL: return <AsepticBatchControlForm {...props} />;
      case FormType.STERILIZER_CONDITIONS: return <SterilizerConditionsForm {...props} />;
      case FormType.ASEPTIC_BAG_BATCH: return <AsepticBagBatchForm {...props} />;
      case FormType.PHYSICAL_CHEMICAL_ANALYSIS: return <PhysicochemicalAnalysisForm {...props} />;
      case FormType.MICROBIOLOGICAL_ANALYSIS: return <MicrobiologicalAnalysisForm {...props} />;
      case FormType.BATCH_GENERATION: return <BatchGenerationForm {...props} />;
      case FormType.EQUIPMENT_CLEANING: return <EquipmentCleaningForm {...props} />;
      case FormType.AIR_CURTAIN_INSPECTION: return <AirCurtainInspectionForm {...props} />;
      case FormType.LAB_CLEANING: return <LabCleaningForm {...props} />;
      case FormType.OZONE_MONITORING: return <OzoneMonitoringForm {...props} />;
      case FormType.PERACETIC_ACID_MONITORING: return <PeraceticAcidMonitoringForm {...props} />;
      case FormType.SCALE_VERIFICATION: return <ScaleVerificationForm {...props} />;
      case FormType.PH_METER_VERIFICATION: return <PHMeterVerificationForm {...props} />;
      case FormType.REFRACTOMETER_VERIFICATION: return <RefractometerVerificationForm {...props} />;
      case FormType.FRIDGE_TEMPERATURE_VERIFICATION: return <FridgeTemperatureForm {...props} />;
      case FormType.BOILER_WATER_PH_REGISTRATION: return <BoilerPHForm {...props} />;
      case FormType.WATER_ANALYSIS: return <WaterAnalysisForm {...props} />;
      case FormType.WATER_TREATMENT: return <WaterTreatmentForm {...props} />;
      case FormType.LABEL_DELIVERY: return <LabelDeliveryForm {...props} />;
      case FormType.CERTIFICATE_OF_ANALYSIS: return <CertificateOfAnalysisForm {...props} />;
      case FormType.FRUIT_REGISTRATION: return <FruitRegistrationForm {...props} />;
      default: return <div className="p-8 text-center text-gray-500">Formulário em desenvolvimento...</div>;
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-4 md:space-y-6 animate-fadeIn pb-24 lg:pb-0">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-gray-500 hover:text-[#E3851B] font-semibold transition-colors group self-start"
        >
          <div className="w-8 h-8 rounded-full bg-white dark:bg-gray-800 border flex items-center justify-center group-hover:bg-orange-50 group-hover:border-orange-200">
            <i className="fas fa-arrow-left text-xs"></i>
          </div>
          <span className="text-sm">{initialRecord ? 'Cancelar Edição' : 'Voltar ao Painel'}</span>
        </button>
        <div className="text-left sm:text-right">
          {initialRecord && <span className="bg-orange-500 text-white px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest mr-4">Modo de Edição</span>}
          <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest block mb-0.5">Protocolo: {config.code}</span>
          <span className="text-[10px] bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded font-medium uppercase">Revisão {config.revision}</span>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl md:rounded-[3rem] shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden relative">
        <div className={`h-1.5 md:h-2 ${config.color}`}></div>
        <div className="p-4 md:p-10">
          <div className="flex items-center gap-3 md:gap-4 mb-6 md:mb-10">
            <div className={`w-10 h-10 md:w-12 md:h-12 ${config.color} rounded-xl flex items-center justify-center text-white shadow-lg`}>
              <i className={`fas ${config.icon} text-lg md:text-xl`}></i>
            </div>
            <h2 className="text-xl md:text-2xl font-black text-[#1A2B34] leading-tight">{config.title}</h2>
          </div>

          {renderForm()}
        </div>

        {showSuccess && (
          <div className="absolute inset-0 bg-white/95 backdrop-blur-sm z-50 flex flex-col items-center justify-center animate-fadeIn p-6">
            <div className={`w-20 h-20 ${isOfflineSave ? 'bg-orange-500' : 'bg-green-500'} rounded-full flex items-center justify-center text-white text-4xl shadow-lg mb-4`}>
              <i className={`fas ${isOfflineSave ? 'fa-cloud-upload-alt' : 'fa-check'}`}></i>
            </div>
            <h3 className="text-2xl font-black text-[#1A2B34] text-center">
              {isOfflineSave ? 'Salvo Offline!' : (initialRecord ? 'Registro Atualizado!' : 'Dados Sincronizados!')}
            </h3>
            <p className="text-gray-500 mt-2 text-center max-w-xs text-sm font-medium">
              {isOfflineSave 
                ? 'O registro foi salvo localmente e será sincronizado quando houver conexão.' 
                : 'As informações foram salvas permanentemente no banco de dados.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FormContainer;

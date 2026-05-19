
export enum FormType {
  FRUIT_DISCHARGE = 'fruit-discharge',
  FRUIT_INTAKE = 'fruit-intake',
  PINEAPPLE_PULP = 'pineapple-pulp',
  BLENDER_RELEASE = 'blender-release',
  BLENDER_CONTROL = 'blender-control',
  REPROCESS_MONITORING = 'reprocess-monitoring',
  ORGANIC_APPLICATION = 'organic-application',
  PESTICIDE_APPLICATION = 'pesticide-application',
  TRUCK_CHECKLIST = 'truck-checklist',
  FIELD_MAPPING = 'field-mapping',
  MATERIAL_MOVEMENT = 'material-movement',
  RECEPTION_ANALYSIS = 'reception-analysis',
  RECEPTION_CHECKLIST = 'reception-checklist',
  FRUIT_TRUCK_INTAKE = 'fruit-truck-intake',
  GATE_REGISTRATION = 'gate-registration',
  ORDER_MOVEMENT = 'order-movement',
  CONTAINER_CHECKLIST = 'container-checklist',
  TRUCK_INSPECTION = 'truck-inspection',
  PACKING_LIST = 'packing-list',
  SHIPPING_ORDER = 'shipping-order',
  SHIPPING_CHECKLIST = 'shipping-checklist',
  PRODUCTION_MONITORING = 'production-monitoring',
  PULPING_OPERATION = 'pulping-operation',
  ASEPTIC_BATCH_CONTROL = 'aseptic-batch-control',
  STERILIZER_CONDITIONS = 'sterilizer-conditions',
  ASEPTIC_BAG_BATCH = 'aseptic-bag-batch',
  PHYSICAL_CHEMICAL_ANALYSIS = 'physical-chemical-analysis',
  MICROBIOLOGICAL_ANALYSIS = 'microbiological-analysis',
  BATCH_GENERATION = 'batch-generation',
  EQUIPMENT_CLEANING = 'equipment-cleaning',
  AIR_CURTAIN_INSPECTION = 'air-curtain-inspection',
  LAB_CLEANING = 'lab-cleaning',
  OZONE_MONITORING = 'ozone-monitoring',
  PERACETIC_ACID_MONITORING = 'peracetic-acid-monitoring',
  SCALE_VERIFICATION = 'scale-verification',
  PH_METER_VERIFICATION = 'ph-meter-verification',
  REFRACTOMETER_VERIFICATION = 'refractometer-verification',
  FRIDGE_TEMPERATURE_VERIFICATION = 'fridge-temperature-verification',
  BOILER_WATER_PH_REGISTRATION = 'boiler-water-ph-registration',
  LABEL_DELIVERY = 'label-delivery',
  WATER_ANALYSIS = 'water-analysis',
  WATER_TREATMENT = 'water-treatment',
  CERTIFICATE_OF_ANALYSIS = 'certificate-of-analysis',
  FRUIT_REGISTRATION = 'fruit-registration'
}

export type UserRole = 'ADMIN_TI' | 'ADMIN' | 'OPERADOR';

export enum LogType {
  ACCESS = 'Acesso',
  FORM = 'Formulário',
  MANAGEMENT = 'Gestão'
}

export interface ActivityLog {
  id: string;
  userId: string;
  userName: string;
  type: LogType;
  action: string;
  timestamp: string;
  details?: string;
}

export interface User {
  id: string;
  name: string;
  username: string;
  password?: string;
  role: UserRole;
  permissions: FormType[];
}

export interface FormMetadata {
  id: string;
  type: FormType;
  title: string;
  code: string;
  revision: string;
  emission: string;
  icon: string;
  color: string;
}

export interface GenericFormData {
  id: string;
  formType: FormType;
  timestamp: string;
  user: string;
  data: any;
}

export interface Fruit {
  id: string;
  name: string;
  type: string;
  variety: string;
  is_organic: 'CONVENCIONAL' | 'ORGÂNICO';
  code: string;
}

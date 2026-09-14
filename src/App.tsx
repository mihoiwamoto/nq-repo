import { Navigate, Route, Routes } from "react-router-dom";
import { AdminLayout } from "./admin/layout/AdminLayout";
import { AdminHomePage } from "./admin/pages/AdminHomePage";
import { LedgerManagementPage } from "./admin/pages/LedgerManagementPage";
import { DataSearchPage } from "./admin/pages/DataSearchPage";
import { ApprovalManagementPage } from "./admin/pages/ApprovalManagementPage";
import { ConfirmationManagementPage } from "./admin/pages/ConfirmationManagementPage";
import { ConfirmationFactorySelectionPage } from "./admin/pages/ConfirmationFactorySelectionPage";
import { ConfirmationDataListPlaceholderPage } from "./admin/pages/ConfirmationDataListPlaceholderPage";
import { RecordsProviderOutlet as WaterConfirmationRecordsProviderOutlet } from "./admin/features/confirmations-water-inspection/RecordsContext";
import { RecordsListPage as WaterConfirmationRecordsListPage } from "./admin/features/confirmations-water-inspection/RecordsListPage";
import { RecordDetailPage as WaterConfirmationRecordDetailPage } from "./admin/features/confirmations-water-inspection/RecordDetailPage";
import { RecordsProviderOutlet as GlassPlasticConfirmationRecordsProviderOutlet } from "./admin/features/confirmations-glass-plastic/RecordsContext";
import { RecordsListPage as GlassPlasticConfirmationRecordsListPage } from "./admin/features/confirmations-glass-plastic/RecordsListPage";
import { RecordDetailPage as GlassPlasticConfirmationRecordDetailPage } from "./admin/features/confirmations-glass-plastic/RecordDetailPage";
import { RecordsProviderOutlet as ScaleConfirmationRecordsProviderOutlet } from "./admin/features/confirmations-scale-inspection/RecordsContext";
import { RecordsListPage as ScaleConfirmationRecordsListPage } from "./admin/features/confirmations-scale-inspection/RecordsListPage";
import { RecordDetailPage as ScaleConfirmationRecordDetailPage } from "./admin/features/confirmations-scale-inspection/RecordDetailPage";
import { RecordsProviderOutlet as SensoryConfirmationRecordsProviderOutlet } from "./admin/features/confirmations-sensory-inspection/RecordsContext";
import { DataListPage as SensoryConfirmationDataListPage } from "./admin/features/confirmations-sensory-inspection/DataListPage";
import { RecordDetailPage as SensoryConfirmationRecordDetailPage } from "./admin/features/confirmations-sensory-inspection/RecordDetailPage";
import { ScoreDetailPage as SensoryConfirmationScoreDetailPage } from "./admin/features/confirmations-sensory-inspection/ScoreDetailPage";
import { RecordsProviderOutlet as MetalConfirmationRecordsProviderOutlet } from "./admin/features/confirmations-metal-xray-detection/RecordsContext";
import { RecordsListPage as MetalConfirmationRecordsListPage } from "./admin/features/confirmations-metal-xray-detection/RecordsListPage";
import { RecordDetailPage as MetalConfirmationRecordDetailPage } from "./admin/features/confirmations-metal-xray-detection/RecordDetailPage";
import { RecordsProviderOutlet as SampleConfirmationRecordsProviderOutlet } from "./admin/features/confirmations-sample-management/RecordsContext";
import { RecordsListPage as SampleConfirmationRecordsListPage } from "./admin/features/confirmations-sample-management/RecordsListPage";
import { RecordDetailPage as SampleConfirmationRecordDetailPage } from "./admin/features/confirmations-sample-management/RecordDetailPage";
import { RecordsProviderOutlet as EquipmentConfirmationRecordsProviderOutlet } from "./admin/features/confirmations-equipment-inspection/RecordsContext";
import { RecordsListPage as EquipmentConfirmationRecordsListPage } from "./admin/features/confirmations-equipment-inspection/RecordsListPage";
import { RecordDetailPage as EquipmentConfirmationRecordDetailPage } from "./admin/features/confirmations-equipment-inspection/RecordDetailPage";
import { RecordsProviderOutlet as CleaningConfirmationRecordsProviderOutlet } from "./admin/features/confirmations-cleaning-record/RecordsContext";
import { RecordsListPage as CleaningConfirmationRecordsListPage } from "./admin/features/confirmations-cleaning-record/RecordsListPage";
import { RecordDetailPage as CleaningConfirmationRecordDetailPage } from "./admin/features/confirmations-cleaning-record/RecordDetailPage";
import { RecordsProviderOutlet as ChemicalConfirmationRecordsProviderOutlet } from "./admin/features/confirmations-chemical-management/RecordsContext";
import { RecordsListPage as ChemicalConfirmationRecordsListPage } from "./admin/features/confirmations-chemical-management/RecordsListPage";
import { RecordDetailPage as ChemicalConfirmationRecordDetailPage } from "./admin/features/confirmations-chemical-management/RecordDetailPage";
import { RecordsProviderOutlet as AdditiveConfirmationRecordsProviderOutlet } from "./admin/features/confirmations-additive-management/RecordsContext";
import { RecordsListPage as AdditiveConfirmationRecordsListPage } from "./admin/features/confirmations-additive-management/RecordsListPage";
import { RecordDetailPage as AdditiveConfirmationRecordDetailPage } from "./admin/features/confirmations-additive-management/RecordDetailPage";
import { AdminLedgerDetailPage } from "./admin/pages/AdminLedgerDetailPage";
import { ScheduleProviderOutlet } from "./admin/features/equipment-inspection/ScheduleContext";
import { CalendarPage } from "./admin/features/equipment-inspection/CalendarPage";
import { NewRegistrationPage } from "./admin/features/equipment-inspection/NewRegistrationPage";
import { ScheduleRegistrationCompletePage } from "./admin/features/equipment-inspection/ScheduleRegistrationCompletePage";
import { ChecklistSettingsPage } from "./admin/features/equipment-inspection/ChecklistSettingsPage";
import { ChecklistDeleteCompletePage } from "./admin/features/equipment-inspection/ChecklistDeleteCompletePage";
import { LineRegistrationPage } from "./admin/features/equipment-inspection/LineRegistrationPage";
import { LineRegistrationCompletePage } from "./admin/features/equipment-inspection/LineRegistrationCompletePage";
import { FactorySelectionPage } from "./admin/features/equipment-inspection/FactorySelectionPage";
import { LineSelectionPage } from "./admin/features/equipment-inspection/LineSelectionPage";
import { LineDetailPage } from "./admin/features/equipment-inspection/LineDetailPage";
import { RecordsProviderOutlet } from "./admin/features/data-search-equipment/RecordsContext";
import { SearchFactorySelectionPage } from "./admin/features/data-search-equipment/SearchFactorySelectionPage";
import { DataListPage } from "./admin/features/data-search-equipment/DataListPage";
import { RecordInspectionListPage } from "./admin/features/data-search-equipment/RecordInspectionListPage";
import { RecordDetailPage } from "./admin/features/data-search-equipment/RecordDetailPage";
import { InspectionItemDetailPage } from "./admin/features/data-search-equipment/InspectionItemDetailPage";
import { AbnormalReactionDetailPage } from "./admin/features/data-search-equipment/AbnormalReactionDetailPage";
import { CleaningRecordProviderOutlet } from "./admin/features/cleaning-record/CleaningRecordContext";
import { FactorySelectionPage as CleaningRecordFactorySelectionPage } from "./admin/features/cleaning-record/FactorySelectionPage";
import { LineSelectionPage as CleaningRecordLineSelectionPage } from "./admin/features/cleaning-record/LineSelectionPage";
import { LineDetailPage as CleaningRecordLineDetailPage } from "./admin/features/cleaning-record/LineDetailPage";
import { LineRegistrationPage as CleaningRecordLineRegistrationPage } from "./admin/features/cleaning-record/LineRegistrationPage";
import { LineRegistrationCompletePage as CleaningRecordLineRegistrationCompletePage } from "./admin/features/cleaning-record/LineRegistrationCompletePage";
import { CalendarPage as CleaningRecordCalendarPage } from "./admin/features/cleaning-record/CalendarPage";
import { NewRegistrationPage as CleaningRecordNewRegistrationPage } from "./admin/features/cleaning-record/NewRegistrationPage";
import { ScheduleRegistrationCompletePage as CleaningRecordScheduleRegistrationCompletePage } from "./admin/features/cleaning-record/ScheduleRegistrationCompletePage";
import { ApprovalRecordsListPage } from "./admin/features/approvals-cleaning-record/ApprovalRecordsListPage";
import { RecordDetailPage as CleaningApprovalRecordDetailPage } from "./admin/features/approvals-cleaning-record/RecordDetailPage";
import { RecordsProviderOutlet as CleaningApprovalRecordsProviderOutlet } from "./admin/features/approvals-cleaning-record/RecordsContext";
import { ApprovalRecordsListPage as EquipmentApprovalRecordsListPage } from "./admin/features/approvals-equipment-inspection/ApprovalRecordsListPage";
import { RecordsProviderOutlet as EquipmentApprovalRecordsProviderOutlet } from "./admin/features/approvals-equipment-inspection/RecordsContext";
import { RecordDetailPage as EquipmentApprovalRecordDetailPage } from "./admin/features/approvals-equipment-inspection/RecordDetailPage";
import { ApprovalRecordsListPage as AdditiveApprovalRecordsListPage } from "./admin/features/approvals-additive-management/ApprovalRecordsListPage";
import { RecordsProviderOutlet as AdditiveApprovalRecordsProviderOutlet } from "./admin/features/approvals-additive-management/RecordsContext";
import { RecordDetailPage as AdditiveApprovalRecordDetailPage } from "./admin/features/approvals-additive-management/RecordDetailPage";
import { ApprovalRecordsListPage as ChemicalApprovalRecordsListPage } from "./admin/features/approvals-chemical-management/ApprovalRecordsListPage";
import { RecordsProviderOutlet as ChemicalApprovalRecordsProviderOutlet } from "./admin/features/approvals-chemical-management/RecordsContext";
import { RecordDetailPage as ChemicalApprovalRecordDetailPage } from "./admin/features/approvals-chemical-management/RecordDetailPage";
import { ApprovalRecordsListPage as SampleApprovalRecordsListPage } from "./admin/features/approvals-sample-management/ApprovalRecordsListPage";
import { RecordsProviderOutlet as SampleApprovalRecordsProviderOutlet } from "./admin/features/approvals-sample-management/RecordsContext";
import { RecordDetailPage as SampleApprovalRecordDetailPage } from "./admin/features/approvals-sample-management/RecordDetailPage";
import { ApprovalRecordsListPage as ScaleApprovalRecordsListPage } from "./admin/features/approvals-scale-inspection/ApprovalRecordsListPage";
import { RecordsProviderOutlet as ScaleApprovalRecordsProviderOutlet } from "./admin/features/approvals-scale-inspection/RecordsContext";
import { RecordDetailPage as ScaleApprovalRecordDetailPage } from "./admin/features/approvals-scale-inspection/RecordDetailPage";
import { ApprovalRecordsListPage as MetalApprovalRecordsListPage } from "./admin/features/approvals-metal-xray-detection/ApprovalRecordsListPage";
import { RecordsProviderOutlet as MetalApprovalRecordsProviderOutlet } from "./admin/features/approvals-metal-xray-detection/RecordsContext";
import { MachineDetailPage as MetalApprovalMachineDetailPage } from "./admin/features/approvals-metal-xray-detection/MachineDetailPage";
import { RecordDetailPage as MetalApprovalRecordDetailPage } from "./admin/features/approvals-metal-xray-detection/RecordDetailPage";
import { ApprovalRecordsListPage as SensoryApprovalRecordsListPage } from "./admin/features/approvals-sensory-inspection/ApprovalRecordsListPage";
import { RecordsProviderOutlet as SensoryApprovalRecordsProviderOutlet } from "./admin/features/approvals-sensory-inspection/RecordsContext";
import { RecordDetailPage as SensoryApprovalRecordDetailPage } from "./admin/features/approvals-sensory-inspection/RecordDetailPage";
import { ScoreDetailPage as SensoryApprovalScoreDetailPage } from "./admin/features/approvals-sensory-inspection/ScoreDetailPage";
import { ApprovalRecordsListPage as WaterApprovalRecordsListPage } from "./admin/features/approvals-water-inspection/ApprovalRecordsListPage";
import { RecordsProviderOutlet as WaterApprovalRecordsProviderOutlet } from "./admin/features/approvals-water-inspection/RecordsContext";
import { RecordDetailPage as WaterApprovalRecordDetailPage } from "./admin/features/approvals-water-inspection/RecordDetailPage";
import { RecordsProviderOutlet as GlassPlasticApprovalRecordsProviderOutlet } from "./admin/features/approvals-glass-plastic/RecordsContext";
import { RecordDetailPage as GlassPlasticApprovalRecordDetailPage } from "./admin/features/approvals-glass-plastic/RecordDetailPage";
import { RecordsProviderOutlet as CleaningRecordsProviderOutlet } from "./admin/features/data-search-cleaning-record/RecordsContext";
import { SearchFactorySelectionPage as CleaningSearchFactorySelectionPage } from "./admin/features/data-search-cleaning-record/SearchFactorySelectionPage";
import { DataListPage as CleaningDataListPage } from "./admin/features/data-search-cleaning-record/DataListPage";
import { RecordDetailPage as CleaningRecordDetailPage } from "./admin/features/data-search-cleaning-record/RecordDetailPage";
import { RecordsProviderOutlet as ChemicalRecordsProviderOutlet } from "./admin/features/data-search-chemical-management/RecordsContext";
import { SearchFactorySelectionPage as ChemicalSearchFactorySelectionPage } from "./admin/features/data-search-chemical-management/SearchFactorySelectionPage";
import { DataListPage as ChemicalDataListPage } from "./admin/features/data-search-chemical-management/DataListPage";
import { RecordDetailPage as ChemicalRecordDetailPage } from "./admin/features/data-search-chemical-management/RecordDetailPage";
import { RecordsProviderOutlet as AdditiveSearchRecordsProviderOutlet } from "./admin/features/data-search-additive-management/RecordsContext";
import { SearchFactorySelectionPage as AdditiveSearchFactorySelectionPage } from "./admin/features/data-search-additive-management/SearchFactorySelectionPage";
import { DataListPage as AdditiveSearchDataListPage } from "./admin/features/data-search-additive-management/DataListPage";
import { RecordDetailPage as AdditiveSearchRecordDetailPage } from "./admin/features/data-search-additive-management/RecordDetailPage";
import { RecordsProviderOutlet as SampleRecordsProviderOutlet } from "./admin/features/data-search-sample-management/RecordsContext";
import { SearchFactorySelectionPage as SampleSearchFactorySelectionPage } from "./admin/features/data-search-sample-management/SearchFactorySelectionPage";
import { DataListPage as SampleDataListPage } from "./admin/features/data-search-sample-management/DataListPage";
import { RecordDetailPage as SampleRecordDetailPage } from "./admin/features/data-search-sample-management/RecordDetailPage";
import { RecordsProviderOutlet as ScaleRecordsProviderOutlet } from "./admin/features/data-search-scale-inspection/RecordsContext";
import { SearchFactorySelectionPage as ScaleSearchFactorySelectionPage } from "./admin/features/data-search-scale-inspection/SearchFactorySelectionPage";
import { DataListPage as ScaleDataListPage } from "./admin/features/data-search-scale-inspection/DataListPage";
import { RecordDetailPage as ScaleRecordDetailPage } from "./admin/features/data-search-scale-inspection/RecordDetailPage";
import { RecordsProviderOutlet as MetalRecordsProviderOutlet } from "./admin/features/data-search-metal-xray-detection/RecordsContext";
import { SearchFactorySelectionPage as MetalSearchFactorySelectionPage } from "./admin/features/data-search-metal-xray-detection/SearchFactorySelectionPage";
import { DataListPage as MetalDataListPage } from "./admin/features/data-search-metal-xray-detection/DataListPage";
import { RecordInspectionListPage as MetalRecordInspectionListPage } from "./admin/features/data-search-metal-xray-detection/RecordInspectionListPage";
import { RecordDetailPage as MetalRecordDetailPage } from "./admin/features/data-search-metal-xray-detection/RecordDetailPage";
import { AbnormalReactionDetailPage as MetalAbnormalReactionDetailPage } from "./admin/features/data-search-metal-xray-detection/AbnormalReactionDetailPage";
import { TestPieceDetailPage as MetalTestPieceDetailPage } from "./admin/features/data-search-metal-xray-detection/TestPieceDetailPage";
import { PassedProductDetailPage as MetalPassedProductDetailPage } from "./admin/features/data-search-metal-xray-detection/PassedProductDetailPage";
import { RecordsProviderOutlet as SensoryRecordsProviderOutlet } from "./admin/features/data-search-sensory-inspection/RecordsContext";
import { SearchFactorySelectionPage as SensorySearchFactorySelectionPage } from "./admin/features/data-search-sensory-inspection/SearchFactorySelectionPage";
import { DataListPage as SensoryDataListPage } from "./admin/features/data-search-sensory-inspection/DataListPage";
import { RecordDetailPage as SensoryRecordDetailPage } from "./admin/features/data-search-sensory-inspection/RecordDetailPage";
import { ScoreDetailPage as SensoryScoreDetailPage } from "./admin/features/data-search-sensory-inspection/ScoreDetailPage";
import { RecordsProviderOutlet as GlassPlasticRecordsProviderOutlet } from "./admin/features/data-search-glass-plastic/RecordsContext";
import { SearchFactorySelectionPage as GlassPlasticSearchFactorySelectionPage } from "./admin/features/data-search-glass-plastic/SearchFactorySelectionPage";
import { FloorSelectionPage as GlassPlasticFloorSelectionPage } from "./admin/features/data-search-glass-plastic/FloorSelectionPage";
import { DataListPage as GlassPlasticDataListPage } from "./admin/features/data-search-glass-plastic/DataListPage";
import { RecordDetailPage as GlassPlasticRecordDetailPage } from "./admin/features/data-search-glass-plastic/RecordDetailPage";
import { RecordsProviderOutlet as WaterSearchRecordsProviderOutlet } from "./admin/features/data-search-water-inspection/RecordsContext";
import { SearchFactorySelectionPage as WaterSearchFactorySelectionPage } from "./admin/features/data-search-water-inspection/SearchFactorySelectionPage";
import { PointSelectionPage as WaterSearchPointSelectionPage } from "./admin/features/data-search-water-inspection/PointSelectionPage";
import { DataListPage as WaterSearchDataListPage } from "./admin/features/data-search-water-inspection/DataListPage";
import { RecordDetailPage as WaterSearchRecordDetailPage } from "./admin/features/data-search-water-inspection/RecordDetailPage";
import { GlassPlasticProviderOutlet as LedgerGlassPlasticProviderOutlet } from "./admin/features/glass-plastic/GlassPlasticContext";
import { FactorySelectionPage as LedgerGlassPlasticFactorySelectionPage } from "./admin/features/glass-plastic/FactorySelectionPage";
import { FloorSelectionPage as LedgerGlassPlasticFloorSelectionPage } from "./admin/features/glass-plastic/FloorSelectionPage";
import { FloorRegistrationPage as LedgerGlassPlasticFloorRegistrationPage } from "./admin/features/glass-plastic/FloorRegistrationPage";
import { FloorDetailPage as LedgerGlassPlasticFloorDetailPage } from "./admin/features/glass-plastic/FloorDetailPage";
import { FloorEditPage as LedgerGlassPlasticFloorEditPage } from "./admin/features/glass-plastic/FloorEditPage";
import { FloorDeleteCompletePage as LedgerGlassPlasticFloorDeleteCompletePage } from "./admin/features/glass-plastic/FloorDeleteCompletePage";
import { FloorRegistrationCompletePage as LedgerGlassPlasticFloorRegistrationCompletePage } from "./admin/features/glass-plastic/FloorRegistrationCompletePage";
import { AdditiveManagementProviderOutlet } from "./admin/features/additive-management/AdditiveManagementContext";
import { FactorySelectionPage as AdditiveManagementFactorySelectionPage } from "./admin/features/additive-management/FactorySelectionPage";
import { AdditiveSelectionPage } from "./admin/features/additive-management/AdditiveSelectionPage";
import { NewRegistrationPage as AdditiveNewRegistrationPage } from "./admin/features/additive-management/NewRegistrationPage";
import { AdditiveDetailPage } from "./admin/features/additive-management/AdditiveDetailPage";
import { AdditiveDeleteCompletePage } from "./admin/features/additive-management/AdditiveDeleteCompletePage";
import { AdditiveRegistrationCompletePage } from "./admin/features/additive-management/AdditiveRegistrationCompletePage";
import { ChemicalManagementProviderOutlet } from "./admin/features/chemical-management/ChemicalManagementContext";
import { FactorySelectionPage as ChemicalManagementFactorySelectionPage } from "./admin/features/chemical-management/FactorySelectionPage";
import { ChemicalSelectionPage } from "./admin/features/chemical-management/ChemicalSelectionPage";
import { NewRegistrationPage as ChemicalNewRegistrationPage } from "./admin/features/chemical-management/NewRegistrationPage";
import { ChemicalDetailPage } from "./admin/features/chemical-management/ChemicalDetailPage";
import { ChemicalDeleteCompletePage } from "./admin/features/chemical-management/ChemicalDeleteCompletePage";
import { ChemicalRegistrationCompletePage } from "./admin/features/chemical-management/ChemicalRegistrationCompletePage";
import { MetalXrayManagementProviderOutlet } from "./admin/features/metal-xray-detection/MetalXrayManagementContext";
import { FactorySelectionPage as MetalXrayFactorySelectionPage } from "./admin/features/metal-xray-detection/FactorySelectionPage";
import { MachineSelectionPage as MetalXrayMachineSelectionPage } from "./admin/features/metal-xray-detection/MachineSelectionPage";
import { NewRegistrationPage as MetalXrayNewRegistrationPage } from "./admin/features/metal-xray-detection/NewRegistrationPage";
import { MachineDetailPage as MetalXrayMachineDetailPage } from "./admin/features/metal-xray-detection/MachineDetailPage";
import { MachineDeleteCompletePage as MetalXrayMachineDeleteCompletePage } from "./admin/features/metal-xray-detection/MachineDeleteCompletePage";
import { NewRegistrationCompletePage as MetalXrayNewRegistrationCompletePage } from "./admin/features/metal-xray-detection/NewRegistrationCompletePage";
import { MetalDetectorProviderOutlet } from "./admin/features/metal-detector-management/MetalDetectorContext";
import { MetalDetectorListPage } from "./admin/features/metal-detector-management/MetalDetectorListPage";
import { NewRegistrationPage as MetalDetectorNewRegistrationPage } from "./admin/features/metal-detector-management/NewRegistrationPage";
import { NewRegistrationCompletePage as MetalDetectorNewRegistrationCompletePage } from "./admin/features/metal-detector-management/NewRegistrationCompletePage";
import { MetalDetectorDetailPage } from "./admin/features/metal-detector-management/MetalDetectorDetailPage";
import { MetalDetectorDeleteCompletePage } from "./admin/features/metal-detector-management/MetalDetectorDeleteCompletePage";
import { ChecklistSettingsPage as MetalDetectorChecklistSettingsPage } from "./admin/features/metal-detector-management/ChecklistSettingsPage";
import { XrayDetectorProviderOutlet } from "./admin/features/xray-detector-management/XrayDetectorContext";
import { XrayDetectorListPage } from "./admin/features/xray-detector-management/XrayDetectorListPage";
import { NewRegistrationPage as XrayDetectorNewRegistrationPage } from "./admin/features/xray-detector-management/NewRegistrationPage";
import { NewRegistrationCompletePage as XrayDetectorNewRegistrationCompletePage } from "./admin/features/xray-detector-management/NewRegistrationCompletePage";
import { XrayDetectorDetailPage } from "./admin/features/xray-detector-management/XrayDetectorDetailPage";
import { XrayDetectorDeleteCompletePage } from "./admin/features/xray-detector-management/XrayDetectorDeleteCompletePage";
import { ChecklistSettingsPage as XrayDetectorChecklistSettingsPage } from "./admin/features/xray-detector-management/ChecklistSettingsPage";
import { WeightCheckerProviderOutlet } from "./admin/features/weight-checker-management/WeightCheckerContext";
import { WeightCheckerListPage } from "./admin/features/weight-checker-management/WeightCheckerListPage";
import { NewRegistrationPage as WeightCheckerNewRegistrationPage } from "./admin/features/weight-checker-management/NewRegistrationPage";
import { NewRegistrationCompletePage as WeightCheckerNewRegistrationCompletePage } from "./admin/features/weight-checker-management/NewRegistrationCompletePage";
import { WeightCheckerDetailPage } from "./admin/features/weight-checker-management/WeightCheckerDetailPage";
import { WeightCheckerDeleteCompletePage } from "./admin/features/weight-checker-management/WeightCheckerDeleteCompletePage";
import { ChecklistSettingsPage as WeightCheckerChecklistSettingsPage } from "./admin/features/weight-checker-management/ChecklistSettingsPage";
import { WaterInspectionProviderOutlet } from "./admin/features/water-inspection/WaterInspectionContext";
import { FactorySelectionPage as WaterInspectionFactorySelectionPage } from "./admin/features/water-inspection/FactorySelectionPage";
import { PointSelectionPage as WaterInspectionPointSelectionPage } from "./admin/features/water-inspection/PointSelectionPage";
import { PointDetailPage as WaterInspectionPointDetailPage } from "./admin/features/water-inspection/PointDetailPage";
import { PointFormPage as WaterInspectionPointFormPage } from "./admin/features/water-inspection/PointFormPage";
import { PointRegistrationCompletePage as WaterInspectionPointRegistrationCompletePage } from "./admin/features/water-inspection/PointRegistrationCompletePage";
import { SampleManagementProviderOutlet } from "./admin/features/sample-management/SampleManagementContext";
import { FactorySelectionPage as SampleManagementFactorySelectionPage } from "./admin/features/sample-management/FactorySelectionPage";
import { ProductSelectionPage as SampleManagementProductSelectionPage } from "./admin/features/sample-management/ProductSelectionPage";
import { ProductDetailPage as SampleManagementProductDetailPage } from "./admin/features/sample-management/ProductDetailPage";
import { ProductDeleteCompletePage as SampleManagementProductDeleteCompletePage } from "./admin/features/sample-management/ProductDeleteCompletePage";
import { NewRegistrationPage as SampleManagementNewRegistrationPage } from "./admin/features/sample-management/NewRegistrationPage";
import { NewRegistrationCompletePage as SampleManagementNewRegistrationCompletePage } from "./admin/features/sample-management/NewRegistrationCompletePage";
import { CalendarPage as SampleManagementCalendarPage } from "./admin/features/sample-management/CalendarPage";
import { ScheduleRegistrationPage as SampleManagementScheduleRegistrationPage } from "./admin/features/sample-management/ScheduleRegistrationPage";
import { ScheduleRegistrationCompletePage as SampleManagementScheduleRegistrationCompletePage } from "./admin/features/sample-management/ScheduleRegistrationCompletePage";
import { SensoryInspectionProviderOutlet as AdminSensoryInspectionProviderOutlet } from "./admin/features/sensory-inspection/SensoryInspectionContext";
import { FactorySelectionPage as SensoryInspectionFactorySelectionPage } from "./admin/features/sensory-inspection/FactorySelectionPage";
import { ProductSelectionPage as SensoryInspectionProductSelectionPage } from "./admin/features/sensory-inspection/ProductSelectionPage";
import { NewRegistrationPage as SensoryInspectionNewRegistrationPage } from "./admin/features/sensory-inspection/NewRegistrationPage";
import { ProductDetailPage as SensoryInspectionProductDetailPage } from "./admin/features/sensory-inspection/ProductDetailPage";
import { ProductDeleteCompletePage as SensoryInspectionProductDeleteCompletePage } from "./admin/features/sensory-inspection/ProductDeleteCompletePage";
import { NewRegistrationCompletePage as SensoryInspectionNewRegistrationCompletePage } from "./admin/features/sensory-inspection/NewRegistrationCompletePage";
import { CalendarPage as SensoryInspectionCalendarPage } from "./admin/features/sensory-inspection/CalendarPage";
import { ScheduleRegistrationPage as SensoryInspectionScheduleRegistrationPage } from "./admin/features/sensory-inspection/ScheduleRegistrationPage";
import { ScheduleRegistrationCompletePage as SensoryInspectionScheduleRegistrationCompletePage } from "./admin/features/sensory-inspection/ScheduleRegistrationCompletePage";
import { ScaleInspectionProviderOutlet as AdminScaleInspectionProviderOutlet } from "./admin/features/scale-inspection/ScaleInspectionContext";
import { FactorySelectionPage as ScaleInspectionFactorySelectionPage } from "./admin/features/scale-inspection/FactorySelectionPage";
import { SettingsPage as ScaleInspectionSettingsPage } from "./admin/features/scale-inspection/SettingsPage";
import { ScaleDetailPage as ScaleInspectionScaleDetailPage } from "./admin/features/scale-inspection/ScaleDetailPage";
import { ScaleFormPage as ScaleInspectionScaleFormPage } from "./admin/features/scale-inspection/ScaleFormPage";
import { ScaleCompletePage as ScaleInspectionScaleCompletePage } from "./admin/features/scale-inspection/ScaleCompletePage";
import { PostDetailPage as ScaleInspectionPostDetailPage } from "./admin/features/scale-inspection/PostDetailPage";
import { PostFormPage as ScaleInspectionPostFormPage } from "./admin/features/scale-inspection/PostFormPage";
import { ScaleManagementDetailPage } from "./admin/features/scale-inspection/ScaleManagementDetailPage";
import { PostManagementListPage } from "./admin/features/scale-inspection/PostManagementListPage";
import { PostManagementCompletePage } from "./admin/features/scale-inspection/PostManagementCompletePage";
import { ScaleManagementListPage } from "./admin/features/scale-inspection/ScaleManagementListPage";
import { ScaleManagementFormPage } from "./admin/features/scale-inspection/ScaleManagementFormPage";
import { ScaleManagementCompletePage } from "./admin/features/scale-inspection/ScaleManagementCompletePage";
import { ProductManagementProviderOutlet } from "./admin/features/product-management/ProductManagementContext";
import { ProductListPage } from "./admin/features/product-management/ProductListPage";
import { HostProductDetailPage } from "./admin/features/product-management/HostProductDetailPage";
import { NqProductDetailPage } from "./admin/features/product-management/NqProductDetailPage";
import { NqProductFormPage } from "./admin/features/product-management/NqProductFormPage";
import { NqProductCompletePage } from "./admin/features/product-management/NqProductCompletePage";
import { CompanyManagementProviderOutlet } from "./admin/features/company-management/CompanyManagementContext";
import { CompanyListPage } from "./admin/features/company-management/CompanyListPage";
import { CompanyDetailPage } from "./admin/features/company-management/CompanyDetailPage";
import { CompanyFormPage } from "./admin/features/company-management/CompanyFormPage";
import { CompanyCompletePage } from "./admin/features/company-management/CompanyCompletePage";
import { FactoryManagementProviderOutlet } from "./admin/features/factory-management/FactoryManagementContext";
import { FactoryListPage } from "./admin/features/factory-management/FactoryListPage";
import { FactoryDetailPage } from "./admin/features/factory-management/FactoryDetailPage";
import { FactoryFormPage } from "./admin/features/factory-management/FactoryFormPage";
import { FactoryCompletePage } from "./admin/features/factory-management/FactoryCompletePage";
import { StaffManagementProviderOutlet } from "./admin/features/staff-management/StaffManagementContext";
import { StaffListPage } from "./admin/features/staff-management/StaffListPage";
import { StaffDetailPage } from "./admin/features/staff-management/StaffDetailPage";
import { StaffFormPage } from "./admin/features/staff-management/StaffFormPage";
import { StaffCompletePage } from "./admin/features/staff-management/StaffCompletePage";
import { LogListPage } from "./admin/features/log-management/LogListPage";
import { HelpPage } from "./admin/features/help/HelpPage";
import { HelpFaqDetailPage } from "./admin/features/help/HelpFaqDetailPage";
import { ScreenCanvasPage } from "./admin/features/guide/ScreenCanvasPage";
import { FeedbackManagementPage } from "./admin/features/feedback/FeedbackManagementPage";
import { AccountPage } from "./admin/features/account/AccountPage";
import { PasswordChangePage } from "./admin/features/account/PasswordChangePage";
import { PasswordChangeCompletePage } from "./admin/features/account/PasswordChangeCompletePage";
import { EmailChangePage } from "./admin/features/account/EmailChangePage";
import { EmailChangeCompletePage } from "./admin/features/account/EmailChangeCompletePage";
import { DeviceListPage } from "./admin/features/device-management/DeviceListPage";
import { DeviceCompletePage } from "./admin/features/device-management/DeviceCompletePage";
import { AdminLoginPage } from "./admin/features/login/AdminLoginPage";
import { AppLoginPage } from "./app/features/login/AppLoginPage";
import { LogoutCompletePage } from "./admin/features/login/LogoutCompletePage";
import { StorageManagementProviderOutlet } from "./admin/features/storage-management/StorageManagementContext";
import { StorageListPage } from "./admin/features/storage-management/StorageListPage";
import { StorageDetailPage } from "./admin/features/storage-management/StorageDetailPage";
import { StorageFormPage } from "./admin/features/storage-management/StorageFormPage";
import { StorageCompletePage } from "./admin/features/storage-management/StorageCompletePage";
import {
  primaryNav as adminPrimaryNav,
  secondaryNav as adminSecondaryNav,
  flattenNavPaths,
} from "./admin/navigation";
import { AppLayout } from "./app/layout/AppLayout";
import { LedgerListPage } from "./app/pages/LedgerListPage";
import { AppLedgerDetailPage } from "./app/pages/AppLedgerDetailPage";
import { LineInspectionPage as AppLineInspectionPage } from "./app/features/equipment-inspection/LineInspectionPage";
import { LineSelectionPage as AppEquipmentLineSelectionPage } from "./app/features/equipment-inspection/LineSelectionPage";
import { ConfirmPage as AppEquipmentConfirmPage } from "./app/features/equipment-inspection/ConfirmPage";
import { InspectionProviderOutlet as AppEquipmentInspectionProviderOutlet } from "./app/features/equipment-inspection/InspectionContext";
import { SubmitCompletePage as AppEquipmentSubmitCompletePage } from "./app/features/equipment-inspection/SubmitCompletePage";
import { SkipConfirmPage as AppEquipmentSkipConfirmPage } from "./app/features/equipment-inspection/SkipConfirmPage";
import { SchedulePage as AppEquipmentSchedulePage } from "./app/features/equipment-inspection/SchedulePage";
import { SchedulePointSettingPage as AppEquipmentSchedulePointSettingPage } from "./app/features/equipment-inspection/SchedulePointSettingPage";
import { SensoryScheduleProviderOutlet } from "./app/features/sensory-inspection/ScheduleContext";
import { ScheduleRegisterPage as AppSensoryScheduleRegisterPage } from "./app/features/sensory-inspection/ScheduleRegisterPage";
import { WaterInspectionProviderOutlet as AppWaterInspectionProviderOutlet } from "./app/features/water-inspection/WaterInspectionContext";
import { PointSelectionPage as AppWaterPointSelectionPage } from "./app/features/water-inspection/PointSelectionPage";
import { PointDetailPage as AppWaterPointDetailPage } from "./app/features/water-inspection/PointDetailPage";
import { PointHistoryTablePage as AppWaterPointHistoryTablePage } from "./app/features/water-inspection/PointHistoryTablePage";
import { RecordEditPage as AppWaterRecordEditPage } from "./app/features/water-inspection/RecordEditPage";
import { RecordEditConfirmPage as AppWaterRecordEditConfirmPage } from "./app/features/water-inspection/RecordEditConfirmPage";
import { RecordEditCompletePage as AppWaterRecordEditCompletePage } from "./app/features/water-inspection/RecordEditCompletePage";
import { NewRecordPage as AppWaterNewRecordPage } from "./app/features/water-inspection/NewRecordPage";
import { NewRecordConfirmPage as AppWaterNewRecordConfirmPage } from "./app/features/water-inspection/NewRecordConfirmPage";
import { NewRecordSubmitCompletePage as AppWaterNewRecordSubmitCompletePage } from "./app/features/water-inspection/NewRecordSubmitCompletePage";
import { SettingsPage as AppSettingsPage } from "./app/features/settings/SettingsPage";
import { LicensePage as AppLicensePage } from "./app/features/settings/LicensePage";
import { TextSizePage as AppTextSizePage } from "./app/features/settings/TextSizePage";
import { HelpPage as AppHelpPage } from "./app/features/help/HelpPage";
import { PendingReviewListPage } from "./app/features/pending-review/PendingReviewListPage";
import { PendingReviewDetailPage } from "./app/features/pending-review/PendingReviewDetailPage";
import { ProgressListPage } from "./app/features/progress/ProgressListPage";
import { LineSelectionPage as AppCleaningLineSelectionPage } from "./app/features/cleaning-record/LineSelectionPage";
import { RecordingPage as AppCleaningRecordingPage } from "./app/features/cleaning-record/RecordingPage";
import { ConfirmPage as AppCleaningConfirmPage } from "./app/features/cleaning-record/ConfirmPage";
import { SkipConfirmPage as AppCleaningSkipConfirmPage } from "./app/features/cleaning-record/SkipConfirmPage";
import { SubmitCompletePage as AppCleaningSubmitCompletePage } from "./app/features/cleaning-record/SubmitCompletePage";
import { CleaningRecordProviderOutlet as AppCleaningRecordProviderOutlet } from "./app/features/cleaning-record/CleaningRecordContext";
import { FloorSelectionPage as AppGlassPlasticFloorSelectionPage } from "./app/features/glass-plastic/FloorSelectionPage";
import { FloorInspectionPage as AppGlassPlasticFloorInspectionPage } from "./app/features/glass-plastic/FloorInspectionPage";
import { FloorInspectionConfirmPage as AppGlassPlasticFloorInspectionConfirmPage } from "./app/features/glass-plastic/FloorInspectionConfirmPage";
import { FloorInspectionCompletePage as AppGlassPlasticFloorInspectionCompletePage } from "./app/features/glass-plastic/FloorInspectionCompletePage";
import { GlassPlasticProviderOutlet } from "./app/features/glass-plastic/GlassPlasticContext";
import { PostSelectionPage as AppScaleInspectionPostSelectionPage } from "./app/features/scale-inspection/PostSelectionPage";
import { ScaleListPage as AppScaleInspectionScaleListPage } from "./app/features/scale-inspection/ScaleListPage";
import { ScaleRecordPage as AppScaleInspectionScaleRecordPage } from "./app/features/scale-inspection/ScaleRecordPage";
import { ConfirmPage as AppScaleInspectionConfirmPage } from "./app/features/scale-inspection/ConfirmPage";
import { SubmitCompletePage as AppScaleInspectionSubmitCompletePage } from "./app/features/scale-inspection/SubmitCompletePage";
import { ScaleReviewPage as AppScaleInspectionScaleReviewPage } from "./app/features/scale-inspection/ScaleReviewPage";
import { ScaleDetailPage as AppScaleInspectionScaleDetailPage } from "./app/features/scale-inspection/ScaleDetailPage";
import { ScaleInspectionProviderOutlet } from "./app/features/scale-inspection/ScaleInspectionContext";
import { ProductSelectionPage as AppSensoryProductSelectionPage } from "./app/features/sensory-inspection/ProductSelectionPage";
import { RecordPage as AppSensoryRecordPage } from "./app/features/sensory-inspection/RecordPage";
import { ConfirmPage as AppSensoryConfirmPage } from "./app/features/sensory-inspection/ConfirmPage";
import { SubmitCompletePage as AppSensorySubmitCompletePage } from "./app/features/sensory-inspection/SubmitCompletePage";
import { ReviewPage as AppSensoryReviewPage } from "./app/features/sensory-inspection/ReviewPage";
import { SensoryInspectionProviderOutlet } from "./app/features/sensory-inspection/SensoryInspectionContext";
import { SampleListPage as AppSampleListPage } from "./app/features/sample-management/SampleListPage";
import { SampleInspectionPage as AppSampleInspectionPage } from "./app/features/sample-management/SampleInspectionPage";
import { SampleConfirmPage as AppSampleConfirmPage } from "./app/features/sample-management/SampleConfirmPage";
import { SampleSubmitCompletePage as AppSampleSubmitCompletePage } from "./app/features/sample-management/SampleSubmitCompletePage";
import { StoredSampleDetailPage as AppStoredSampleDetailPage } from "./app/features/sample-management/StoredSampleDetailPage";
import { MachineSelectionPage as AppMetalXrayMachineSelectionPage } from "./app/features/metal-xray-detection/MachineSelectionPage";
import { MachineDetailPage as AppMetalXrayMachineDetailPage } from "./app/features/metal-xray-detection/MachineDetailPage";
import { MachineRecordFormPage as AppMetalXrayMachineRecordFormPage } from "./app/features/metal-xray-detection/MachineRecordFormPage";
import { MachineConfirmPage as AppMetalXrayMachineConfirmPage } from "./app/features/metal-xray-detection/MachineConfirmPage";
import { MachineRecordDetailPage as AppMetalXrayMachineRecordDetailPage } from "./app/features/metal-xray-detection/MachineRecordDetailPage";
import { MachineReviewPage as AppMetalXrayMachineReviewPage } from "./app/features/metal-xray-detection/MachineReviewPage";
import { MachineSubmitCompletePage as AppMetalXrayMachineSubmitCompletePage } from "./app/features/metal-xray-detection/MachineSubmitCompletePage";
import { ProductSelectionPage as AppAdditiveProductSelectionPage } from "./app/features/additive-management/ProductSelectionPage";
import { RecordsListPage as AppAdditiveRecordsListPage } from "./app/features/additive-management/RecordsListPage";
import { RecordingPage as AppAdditiveRecordingPage } from "./app/features/additive-management/RecordingPage";
import { ConfirmPage as AppAdditiveConfirmPage } from "./app/features/additive-management/ConfirmPage";
import { SubmitCompletePage as AppAdditiveSubmitCompletePage } from "./app/features/additive-management/SubmitCompletePage";
import { RecordDetailPage as AppAdditiveRecordDetailPage } from "./app/features/additive-management/RecordDetailPage";
import { AdditiveManagementProviderOutlet as AppAdditiveManagementProviderOutlet } from "./app/features/additive-management/AdditiveManagementContext";
import { ChemicalSelectionPage as AppChemicalSelectionPage } from "./app/features/chemical-management/ChemicalSelectionPage";
import { ChemicalRecordsListPage as AppChemicalRecordsListPage } from "./app/features/chemical-management/ChemicalRecordsListPage";
import { ChemicalRecordDetailPage as AppChemicalRecordDetailPage } from "./app/features/chemical-management/ChemicalRecordDetailPage";
import { ChemicalRecordingPage as AppChemicalRecordingPage } from "./app/features/chemical-management/ChemicalRecordingPage";
import { ChemicalConfirmPage as AppChemicalConfirmPage } from "./app/features/chemical-management/ChemicalConfirmPage";
import { ChemicalSubmitCompletePage as AppChemicalSubmitCompletePage } from "./app/features/chemical-management/ChemicalSubmitCompletePage";
import { ChemicalManagementProviderOutlet as AppChemicalManagementProviderOutlet } from "./app/features/chemical-management/ChemicalManagementContext";
import { SpecimenManagementConfirmPage as AppSpecimenManagementConfirmPage } from "./app/features/specimen-management/SpecimenManagementConfirmPage";
import { SpecimenListPage as AppSpecimenListPage } from "./app/features/specimen-management/SpecimenListPage";
import { railNav } from "./app/navigation";
import { HomePage } from "./pages/HomePage";
import { ComingSoonPage } from "./pages/ComingSoonPage";
import { PageDescriptionButton } from "./components/PageDescriptionButton";
import { FeedbackWidget } from "./components/feedback/FeedbackWidget";

const adminPlaceholderRoutes = flattenNavPaths([...adminPrimaryNav, ...adminSecondaryNav]).filter(
  (item) =>
    item.path !== "/admin/home" &&
    item.path !== "/admin/ledger-management" &&
    item.path !== "/admin/data-search" &&
    item.path !== "/admin/approvals" &&
    item.path !== "/admin/company" &&
    item.path !== "/admin/factory" &&
    item.path !== "/admin/staff" &&
    item.path !== "/admin/logs" &&
    item.path !== "/admin/help" &&
    item.path !== "/admin/guide/screens" &&
    item.path !== "/admin/guide/feedback" &&
    item.path !== "/admin/devices" &&
    item.path !== "/admin/storage"
);

const appPlaceholderRoutes = railNav.filter(
  (item) =>
    item.path !== "/app/ledger-list" &&
    item.path !== "/app/progress" &&
    item.path !== "/app/pending-review" &&
    item.path !== "/app/schedule" &&
    item.path !== "/app/settings" &&
    item.path !== "/app/help"
);

function App() {
  return (
    <>
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/admin/login" element={<AdminLoginPage />} />
      <Route path="/admin/logout" element={<LogoutCompletePage />} />
      <Route path="/app/login" element={<AppLoginPage />} />

      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<Navigate to="home" replace />} />
        <Route path="home" element={<AdminHomePage />} />
        <Route path="ledger-management" element={<LedgerManagementPage />} />
        <Route path="ledger-management/equipment-inspection" element={<ScheduleProviderOutlet />}>
          <Route index element={<FactorySelectionPage />} />
          <Route path="factories/:factoryId" element={<LineSelectionPage />} />
          <Route path="factories/:factoryId/schedule" element={<CalendarPage />} />
          <Route path="factories/:factoryId/schedule/register" element={<NewRegistrationPage />} />
          <Route
            path="factories/:factoryId/schedule/register/complete"
            element={<ScheduleRegistrationCompletePage />}
          />
          <Route
            path="factories/:factoryId/checklist-settings"
            element={<ChecklistSettingsPage />}
          />
          <Route
            path="factories/:factoryId/checklist-settings/deleted"
            element={<ChecklistDeleteCompletePage />}
          />
          <Route path="factories/:factoryId/lines/new" element={<LineRegistrationPage />} />
          <Route
            path="factories/:factoryId/lines/registered"
            element={<LineRegistrationCompletePage />}
          />
          <Route path="factories/:factoryId/lines/:lineId" element={<LineDetailPage />} />
        </Route>
        <Route path="ledger-management/cleaning-record" element={<CleaningRecordProviderOutlet />}>
          <Route index element={<CleaningRecordFactorySelectionPage />} />
          <Route path="factories/:factoryId" element={<CleaningRecordLineSelectionPage />} />
          <Route
            path="factories/:factoryId/schedule"
            element={<CleaningRecordCalendarPage />}
          />
          <Route
            path="factories/:factoryId/schedule/register"
            element={<CleaningRecordNewRegistrationPage />}
          />
          <Route
            path="factories/:factoryId/schedule/registered"
            element={<CleaningRecordScheduleRegistrationCompletePage />}
          />
          <Route
            path="factories/:factoryId/lines/new"
            element={<CleaningRecordLineRegistrationPage />}
          />
          <Route
            path="factories/:factoryId/lines/registered"
            element={<CleaningRecordLineRegistrationCompletePage />}
          />
          <Route
            path="factories/:factoryId/lines/:lineId"
            element={<CleaningRecordLineDetailPage />}
          />
        </Route>
        <Route
          path="ledger-management/additive-management"
          element={<AdditiveManagementProviderOutlet />}
        >
          <Route index element={<AdditiveManagementFactorySelectionPage />} />
          <Route path="factories/:factoryId" element={<AdditiveSelectionPage />} />
          <Route path="factories/:factoryId/additives/new" element={<AdditiveNewRegistrationPage />} />
          <Route
            path="factories/:factoryId/additives/registered"
            element={<AdditiveRegistrationCompletePage />}
          />
          <Route
            path="factories/:factoryId/additives/deleted"
            element={<AdditiveDeleteCompletePage />}
          />
          <Route path="factories/:factoryId/additives/:additiveId" element={<AdditiveDetailPage />} />
          <Route
            path="factories/:factoryId/additives/:additiveId/edit"
            element={<AdditiveNewRegistrationPage />}
          />
        </Route>
        <Route
          path="ledger-management/chemical-management"
          element={<ChemicalManagementProviderOutlet />}
        >
          <Route index element={<ChemicalManagementFactorySelectionPage />} />
          <Route path="factories/:factoryId" element={<ChemicalSelectionPage />} />
          <Route path="factories/:factoryId/chemicals/new" element={<ChemicalNewRegistrationPage />} />
          <Route
            path="factories/:factoryId/chemicals/registered"
            element={<ChemicalRegistrationCompletePage />}
          />
          <Route
            path="factories/:factoryId/chemicals/deleted"
            element={<ChemicalDeleteCompletePage />}
          />
          <Route path="factories/:factoryId/chemicals/:chemicalId" element={<ChemicalDetailPage />} />
          <Route
            path="factories/:factoryId/chemicals/:chemicalId/edit"
            element={<ChemicalNewRegistrationPage />}
          />
        </Route>
        <Route
          path="ledger-management/water-inspection"
          element={<WaterInspectionProviderOutlet />}
        >
          <Route index element={<WaterInspectionFactorySelectionPage />} />
          <Route path="factories/:factoryId" element={<WaterInspectionPointSelectionPage />} />
          <Route path="factories/:factoryId/points/new" element={<WaterInspectionPointFormPage />} />
          <Route
            path="factories/:factoryId/points/registered"
            element={<WaterInspectionPointRegistrationCompletePage />}
          />
          <Route path="factories/:factoryId/points/:pointId" element={<WaterInspectionPointDetailPage />} />
          <Route
            path="factories/:factoryId/points/:pointId/edit"
            element={<WaterInspectionPointFormPage />}
          />
        </Route>
        <Route
          path="ledger-management/sample-management"
          element={<SampleManagementProviderOutlet />}
        >
          <Route index element={<SampleManagementFactorySelectionPage />} />
          <Route path="factories/:factoryId" element={<SampleManagementProductSelectionPage />} />
          <Route
            path="factories/:factoryId/schedule"
            element={<SampleManagementCalendarPage />}
          />
          <Route
            path="factories/:factoryId/schedule/register"
            element={<SampleManagementScheduleRegistrationPage />}
          />
          <Route
            path="factories/:factoryId/schedule/register/complete"
            element={<SampleManagementScheduleRegistrationCompletePage />}
          />
          <Route
            path="factories/:factoryId/products/new"
            element={<SampleManagementNewRegistrationPage />}
          />
          <Route
            path="factories/:factoryId/products/new/complete"
            element={<SampleManagementNewRegistrationCompletePage />}
          />
          <Route
            path="factories/:factoryId/products/deleted"
            element={<SampleManagementProductDeleteCompletePage />}
          />
          <Route
            path="factories/:factoryId/products/:productId"
            element={<SampleManagementProductDetailPage />}
          />
        </Route>
        <Route
          path="ledger-management/sensory-inspection"
          element={<AdminSensoryInspectionProviderOutlet />}
        >
          <Route index element={<SensoryInspectionFactorySelectionPage />} />
          <Route path="factories/:factoryId" element={<SensoryInspectionProductSelectionPage />} />
          <Route
            path="factories/:factoryId/schedule"
            element={<SensoryInspectionCalendarPage />}
          />
          <Route
            path="factories/:factoryId/schedule/register"
            element={<SensoryInspectionScheduleRegistrationPage />}
          />
          <Route
            path="factories/:factoryId/schedule/register/complete"
            element={<SensoryInspectionScheduleRegistrationCompletePage />}
          />
          <Route
            path="factories/:factoryId/products/new"
            element={<SensoryInspectionNewRegistrationPage />}
          />
          <Route
            path="factories/:factoryId/products/new/complete"
            element={<SensoryInspectionNewRegistrationCompletePage />}
          />
          <Route
            path="factories/:factoryId/products/deleted"
            element={<SensoryInspectionProductDeleteCompletePage />}
          />
          <Route
            path="factories/:factoryId/products/:productId"
            element={<SensoryInspectionProductDetailPage />}
          />
          <Route
            path="factories/:factoryId/products/:productId/edit"
            element={<SensoryInspectionNewRegistrationPage />}
          />
        </Route>
        <Route
          path="ledger-management/metal-xray-detection"
          element={<MetalXrayManagementProviderOutlet />}
        >
          <Route index element={<MetalXrayFactorySelectionPage />} />
          <Route path="factories/:factoryId" element={<MetalXrayMachineSelectionPage />} />
          <Route
            path="factories/:factoryId/machines/new"
            element={<MetalXrayNewRegistrationPage />}
          />
          <Route
            path="factories/:factoryId/machines/new/complete"
            element={<MetalXrayNewRegistrationCompletePage />}
          />
          <Route
            path="factories/:factoryId/machines/deleted"
            element={<MetalXrayMachineDeleteCompletePage />}
          />
          <Route
            path="factories/:factoryId/machines/:machineId"
            element={<MetalXrayMachineDetailPage />}
          />
          <Route
            path="factories/:factoryId/machines/:machineId/edit"
            element={<MetalXrayNewRegistrationPage />}
          />
          <Route
            path="factories/:factoryId/metal-detectors"
            element={<MetalDetectorProviderOutlet />}
          >
            <Route index element={<MetalDetectorListPage />} />
            <Route path="new" element={<MetalDetectorNewRegistrationPage />} />
            <Route path="new/complete" element={<MetalDetectorNewRegistrationCompletePage />} />
            <Route path="deleted" element={<MetalDetectorDeleteCompletePage />} />
            <Route path="check-items" element={<MetalDetectorChecklistSettingsPage />} />
            <Route path=":unitId" element={<MetalDetectorDetailPage />} />
            <Route path=":unitId/edit" element={<MetalDetectorNewRegistrationPage />} />
          </Route>

          <Route
            path="factories/:factoryId/xray-detectors"
            element={<XrayDetectorProviderOutlet />}
          >
            <Route index element={<XrayDetectorListPage />} />
            <Route path="new" element={<XrayDetectorNewRegistrationPage />} />
            <Route path="new/complete" element={<XrayDetectorNewRegistrationCompletePage />} />
            <Route path="deleted" element={<XrayDetectorDeleteCompletePage />} />
            <Route path="check-items" element={<XrayDetectorChecklistSettingsPage />} />
            <Route path=":unitId" element={<XrayDetectorDetailPage />} />
            <Route path=":unitId/edit" element={<XrayDetectorNewRegistrationPage />} />
          </Route>
          <Route
            path="factories/:factoryId/weight-checkers"
            element={<WeightCheckerProviderOutlet />}
          >
            <Route index element={<WeightCheckerListPage />} />
            <Route path="new" element={<WeightCheckerNewRegistrationPage />} />
            <Route path="new/complete" element={<WeightCheckerNewRegistrationCompletePage />} />
            <Route path="deleted" element={<WeightCheckerDeleteCompletePage />} />
            <Route path="check-items" element={<WeightCheckerChecklistSettingsPage />} />
            <Route path=":unitId" element={<WeightCheckerDetailPage />} />
            <Route path=":unitId/edit" element={<WeightCheckerNewRegistrationPage />} />
          </Route>
        </Route>
        <Route
          path="ledger-management/scale-inspection"
          element={<AdminScaleInspectionProviderOutlet />}
        >
          <Route index element={<ScaleInspectionFactorySelectionPage />} />
          <Route path="factories/:factoryId" element={<ScaleInspectionSettingsPage />} />
          <Route path="factories/:factoryId/scales/new" element={<ScaleInspectionScaleFormPage />} />
          <Route
            path="factories/:factoryId/scales/registered"
            element={<ScaleInspectionScaleCompletePage />}
          />
          <Route path="factories/:factoryId/scales/:scaleId" element={<ScaleInspectionScaleDetailPage />} />
          <Route
            path="factories/:factoryId/scales/:scaleId/edit"
            element={<ScaleInspectionScaleFormPage />}
          />
          <Route path="factories/:factoryId/posts/new" element={<ScaleInspectionPostFormPage />} />
          <Route path="factories/:factoryId/posts/:postId" element={<ScaleInspectionPostDetailPage />} />
          <Route
            path="factories/:factoryId/posts/:postId/edit"
            element={<ScaleInspectionPostFormPage />}
          />
          <Route
            path="factories/:factoryId/scale-management"
            element={<ScaleManagementListPage />}
          />
          <Route
            path="factories/:factoryId/scale-management/new"
            element={<ScaleManagementFormPage />}
          />
          <Route
            path="factories/:factoryId/scale-management/new/complete"
            element={<ScaleManagementCompletePage message="秤管理の新規登録が完了しました" />}
          />
          <Route
            path="factories/:factoryId/scale-management/deleted"
            element={<ScaleManagementCompletePage message="秤管理の削除が完了しました" />}
          />
          <Route
            path="factories/:factoryId/scale-management/:scaleId"
            element={<ScaleManagementDetailPage />}
          />
          <Route
            path="factories/:factoryId/scale-management/:scaleId/edit"
            element={<ScaleManagementFormPage />}
          />
          <Route
            path="factories/:factoryId/post-management"
            element={<PostManagementListPage />}
          />
          <Route
            path="factories/:factoryId/post-management/new"
            element={<ScaleInspectionPostFormPage />}
          />
          <Route
            path="factories/:factoryId/post-management/new/complete"
            element={<PostManagementCompletePage message="持ち場管理の新規登録が完了しました" />}
          />
          <Route
            path="factories/:factoryId/post-management/deleted"
            element={<PostManagementCompletePage message="持ち場管理の削除が完了しました" />}
          />
        </Route>
        <Route
          path="ledger-management/glass-plastic"
          element={<LedgerGlassPlasticProviderOutlet />}
        >
          <Route index element={<LedgerGlassPlasticFactorySelectionPage />} />
          <Route path="factories/:factoryId" element={<LedgerGlassPlasticFloorSelectionPage />} />
          <Route
            path="factories/:factoryId/floors/new"
            element={<LedgerGlassPlasticFloorRegistrationPage />}
          />
          <Route
            path="factories/:factoryId/floors/deleted"
            element={<LedgerGlassPlasticFloorDeleteCompletePage />}
          />
          <Route
            path="factories/:factoryId/floors/registered"
            element={<LedgerGlassPlasticFloorRegistrationCompletePage />}
          />
          <Route
            path="factories/:factoryId/floors/:floorId/edit"
            element={<LedgerGlassPlasticFloorEditPage />}
          />
          <Route
            path="factories/:factoryId/floors/:floorId"
            element={<LedgerGlassPlasticFloorDetailPage />}
          />
        </Route>
        <Route
          path="ledger-management/:slug"
          element={<AdminLedgerDetailPage basePath="/admin/ledger-management" backLabel="帳票管理" />}
        />
        <Route path="data-search" element={<DataSearchPage />} />
        <Route path="data-search/equipment-inspection" element={<RecordsProviderOutlet />}>
          <Route index element={<SearchFactorySelectionPage />} />
          <Route path="factories/:factoryId" element={<DataListPage />} />
          <Route path="factories/:factoryId/records/:recordId" element={<RecordDetailPage />} />
          <Route path="factories/:factoryId/records/:recordId/list" element={<RecordInspectionListPage />} />
          <Route path="factories/:factoryId/records/:recordId/details" element={<InspectionItemDetailPage />} />
          <Route path="factories/:factoryId/records/:recordId/abnormal-reaction" element={<AbnormalReactionDetailPage />} />
        </Route>
        <Route path="data-search/cleaning-record" element={<CleaningRecordsProviderOutlet />}>
          <Route index element={<CleaningSearchFactorySelectionPage />} />
          <Route path="factories/:factoryId" element={<CleaningDataListPage />} />
          <Route
            path="factories/:factoryId/records/:recordId"
            element={<CleaningRecordDetailPage />}
          />
        </Route>
        <Route path="data-search/chemical-management" element={<ChemicalRecordsProviderOutlet />}>
          <Route index element={<ChemicalSearchFactorySelectionPage />} />
          <Route path="factories/:factoryId" element={<ChemicalDataListPage />} />
          <Route
            path="factories/:factoryId/records/:recordId"
            element={<ChemicalRecordDetailPage />}
          />
        </Route>
        <Route path="data-search/additive-management" element={<AdditiveSearchRecordsProviderOutlet />}>
          <Route index element={<AdditiveSearchFactorySelectionPage />} />
          <Route path="factories/:factoryId" element={<AdditiveSearchDataListPage />} />
          <Route
            path="factories/:factoryId/records/:recordId"
            element={<AdditiveSearchRecordDetailPage />}
          />
        </Route>
        <Route path="data-search/sample-management" element={<SampleRecordsProviderOutlet />}>
          <Route index element={<SampleSearchFactorySelectionPage />} />
          <Route path="factories/:factoryId" element={<SampleDataListPage />} />
          <Route
            path="factories/:factoryId/records/:recordId"
            element={<SampleRecordDetailPage />}
          />
        </Route>
        <Route path="data-search/scale-inspection" element={<ScaleRecordsProviderOutlet />}>
          <Route index element={<ScaleSearchFactorySelectionPage />} />
          <Route path="factories/:factoryId" element={<ScaleDataListPage />} />
          <Route
            path="factories/:factoryId/records/:recordId"
            element={<ScaleRecordDetailPage />}
          />
        </Route>
        <Route path="data-search/metal-xray-detection" element={<MetalRecordsProviderOutlet />}>
          <Route index element={<MetalSearchFactorySelectionPage />} />
          <Route path="factories/:factoryId" element={<MetalDataListPage />} />
          <Route path="factories/:factoryId/records/:recordId" element={<MetalRecordInspectionListPage />} />
          <Route
            path="factories/:factoryId/records/:recordId/details"
            element={<MetalRecordDetailPage />}
          />
          <Route
            path="factories/:factoryId/records/:recordId/abnormal-reaction"
            element={<MetalAbnormalReactionDetailPage />}
          />
          <Route
            path="factories/:factoryId/records/:recordId/test-piece"
            element={<MetalTestPieceDetailPage />}
          />
          <Route
            path="factories/:factoryId/records/:recordId/passed-product"
            element={<MetalPassedProductDetailPage />}
          />
        </Route>
        <Route path="data-search/sensory-inspection" element={<SensoryRecordsProviderOutlet />}>
          <Route index element={<SensorySearchFactorySelectionPage />} />
          <Route path="factories/:factoryId" element={<SensoryDataListPage />} />
          <Route
            path="factories/:factoryId/records/:recordId"
            element={<SensoryRecordDetailPage />}
          />
          <Route
            path="factories/:factoryId/records/:recordId/scores/:scoreId"
            element={<SensoryScoreDetailPage />}
          />
        </Route>
        <Route path="data-search/glass-plastic" element={<GlassPlasticRecordsProviderOutlet />}>
          <Route index element={<GlassPlasticSearchFactorySelectionPage />} />
          <Route path="factories/:factoryId" element={<GlassPlasticFloorSelectionPage />} />
          <Route
            path="factories/:factoryId/floors/:floorId"
            element={<GlassPlasticDataListPage />}
          />
          <Route
            path="factories/:factoryId/floors/:floorId/records/:recordId"
            element={<GlassPlasticRecordDetailPage />}
          />
        </Route>
        <Route path="data-search/water-inspection" element={<WaterSearchRecordsProviderOutlet />}>
          <Route index element={<WaterSearchFactorySelectionPage />} />
          <Route path="factories/:factoryId" element={<WaterSearchPointSelectionPage />} />
          <Route
            path="factories/:factoryId/points/:pointId"
            element={<WaterSearchDataListPage />}
          />
          <Route
            path="factories/:factoryId/points/:pointId/records/:recordId"
            element={<WaterSearchRecordDetailPage />}
          />
        </Route>
        <Route
          path="data-search/:slug"
          element={<AdminLedgerDetailPage basePath="/admin/data-search" backLabel="データ検索" />}
        />
        <Route path="approvals" element={<ApprovalManagementPage />} />
        <Route path="confirmations" element={<ConfirmationManagementPage />} />
        <Route path="confirmations/:slug" element={<ConfirmationFactorySelectionPage />} />
        <Route
          path="confirmations/water-inspection/factories/:factoryId"
          element={<WaterConfirmationRecordsProviderOutlet />}
        >
          <Route index element={<WaterConfirmationRecordsListPage />} />
          <Route path="records/:recordId" element={<WaterConfirmationRecordDetailPage />} />
        </Route>
        <Route
          path="confirmations/glass-plastic/factories/:factoryId"
          element={<GlassPlasticConfirmationRecordsProviderOutlet />}
        >
          <Route index element={<GlassPlasticConfirmationRecordsListPage />} />
          <Route path="records/:recordId" element={<GlassPlasticConfirmationRecordDetailPage />} />
        </Route>
        <Route
          path="confirmations/scale-inspection/factories/:factoryId"
          element={<ScaleConfirmationRecordsProviderOutlet />}
        >
          <Route index element={<ScaleConfirmationRecordsListPage />} />
          <Route path="records/:recordId" element={<ScaleConfirmationRecordDetailPage />} />
        </Route>
        <Route
          path="confirmations/sensory-inspection/factories/:factoryId"
          element={<SensoryConfirmationRecordsProviderOutlet />}
        >
          <Route index element={<SensoryConfirmationDataListPage />} />
          <Route path="records/:recordId" element={<SensoryConfirmationRecordDetailPage />} />
          <Route path="records/:recordId/scores/:scoreId" element={<SensoryConfirmationScoreDetailPage />} />
        </Route>
        <Route
          path="confirmations/metal-xray-detection/factories/:factoryId"
          element={<MetalConfirmationRecordsProviderOutlet />}
        >
          <Route index element={<MetalConfirmationRecordsListPage />} />
          <Route path="records/:recordId" element={<MetalConfirmationRecordDetailPage />} />
        </Route>
        <Route
          path="confirmations/sample-management/factories/:factoryId"
          element={<SampleConfirmationRecordsProviderOutlet />}
        >
          <Route index element={<SampleConfirmationRecordsListPage />} />
          <Route path="records/:recordId" element={<SampleConfirmationRecordDetailPage />} />
        </Route>
        <Route
          path="confirmations/equipment-inspection/factories/:factoryId"
          element={<EquipmentConfirmationRecordsProviderOutlet />}
        >
          <Route index element={<EquipmentConfirmationRecordsListPage />} />
          <Route path="records/:recordId" element={<EquipmentConfirmationRecordDetailPage />} />
        </Route>
        <Route
          path="confirmations/cleaning-record/factories/:factoryId"
          element={<CleaningConfirmationRecordsProviderOutlet />}
        >
          <Route index element={<CleaningConfirmationRecordsListPage />} />
          <Route path="records/:recordId" element={<CleaningConfirmationRecordDetailPage />} />
        </Route>
        <Route
          path="confirmations/chemical-management/factories/:factoryId"
          element={<ChemicalConfirmationRecordsProviderOutlet />}
        >
          <Route index element={<ChemicalConfirmationRecordsListPage />} />
          <Route path="records/:recordId" element={<ChemicalConfirmationRecordDetailPage />} />
        </Route>
        <Route
          path="confirmations/additive-management/factories/:factoryId"
          element={<AdditiveConfirmationRecordsProviderOutlet />}
        >
          <Route index element={<AdditiveConfirmationRecordsListPage />} />
          <Route path="records/:recordId" element={<AdditiveConfirmationRecordDetailPage />} />
        </Route>
        <Route
          path="confirmations/:slug/factories/:factoryId"
          element={<ConfirmationDataListPlaceholderPage />}
        />
        <Route path="approvals/cleaning-record" element={<CleaningApprovalRecordsProviderOutlet />}>
          <Route index element={<ApprovalRecordsListPage />} />
          <Route path="records/:recordId" element={<CleaningApprovalRecordDetailPage />} />
        </Route>
        <Route
          path="approvals/equipment-inspection"
          element={<EquipmentApprovalRecordsProviderOutlet />}
        >
          <Route index element={<EquipmentApprovalRecordsListPage />} />
          <Route path="records/:recordId" element={<EquipmentApprovalRecordDetailPage />} />
        </Route>
        <Route
          path="approvals/additive-management"
          element={<AdditiveApprovalRecordsProviderOutlet />}
        >
          <Route index element={<AdditiveApprovalRecordsListPage />} />
          <Route path="records/:recordId" element={<AdditiveApprovalRecordDetailPage />} />
        </Route>
        <Route
          path="approvals/chemical-management"
          element={<ChemicalApprovalRecordsProviderOutlet />}
        >
          <Route index element={<ChemicalApprovalRecordsListPage />} />
          <Route path="records/:recordId" element={<ChemicalApprovalRecordDetailPage />} />
        </Route>
        <Route
          path="approvals/sample-management"
          element={<SampleApprovalRecordsProviderOutlet />}
        >
          <Route index element={<SampleApprovalRecordsListPage />} />
          <Route path="records/:recordId" element={<SampleApprovalRecordDetailPage />} />
        </Route>
        <Route
          path="approvals/scale-inspection/:requestId"
          element={<ScaleApprovalRecordsProviderOutlet />}
        >
          <Route index element={<ScaleApprovalRecordsListPage />} />
          <Route path="records/:recordId" element={<ScaleApprovalRecordDetailPage />} />
        </Route>
        <Route
          path="approvals/metal-xray-detection"
          element={<MetalApprovalRecordsProviderOutlet />}
        >
          <Route index element={<MetalApprovalRecordsListPage />} />
          <Route path="records/:recordId" element={<MetalApprovalMachineDetailPage />} />
          <Route
            path="records/:recordId/items/:itemId"
            element={<MetalApprovalRecordDetailPage />}
          />
        </Route>
        <Route
          path="approvals/sensory-inspection"
          element={<SensoryApprovalRecordsProviderOutlet />}
        >
          <Route index element={<SensoryApprovalRecordsListPage />} />
          <Route path="records/:recordId" element={<SensoryApprovalRecordDetailPage />} />
          <Route
            path="records/:recordId/scores/:scoreId"
            element={<SensoryApprovalScoreDetailPage />}
          />
        </Route>
        <Route
          path="approvals/water-inspection"
          element={<WaterApprovalRecordsProviderOutlet />}
        >
          <Route index element={<WaterApprovalRecordsListPage />} />
          <Route path="records/:recordId" element={<WaterApprovalRecordDetailPage />} />
        </Route>
        <Route
          path="approvals/glass-plastic"
          element={<GlassPlasticApprovalRecordsProviderOutlet />}
        >
          <Route index element={<GlassPlasticApprovalRecordDetailPage />} />
        </Route>
        <Route path="products" element={<ProductManagementProviderOutlet />}>
          <Route index element={<ProductListPage />} />
          <Route path="host/:productId" element={<HostProductDetailPage />} />
          <Route path="nq/new" element={<NqProductFormPage />} />
          <Route path="nq/new/complete" element={<NqProductCompletePage />} />
          <Route path="nq/deleted" element={<NqProductCompletePage />} />
          <Route path="nq/:productId" element={<NqProductDetailPage />} />
          <Route path="nq/:productId/edit" element={<NqProductFormPage />} />
        </Route>
        <Route path="company" element={<CompanyManagementProviderOutlet />}>
          <Route index element={<CompanyListPage />} />
          <Route path="new" element={<CompanyFormPage />} />
          <Route
            path="new/complete"
            element={<CompanyCompletePage message="企業情報の新規登録が完了しました" />}
          />
          <Route
            path="deleted"
            element={<CompanyCompletePage message="企業情報の削除が完了しました" />}
          />
          <Route path=":companyId" element={<CompanyDetailPage />} />
          <Route path=":companyId/edit" element={<CompanyFormPage />} />
        </Route>
        <Route path="factory" element={<FactoryManagementProviderOutlet />}>
          <Route index element={<FactoryListPage />} />
          <Route path="new" element={<FactoryFormPage />} />
          <Route
            path="new/complete"
            element={<FactoryCompletePage message="工場情報の新規登録が完了しました" />}
          />
          <Route
            path="deleted"
            element={<FactoryCompletePage message="工場情報の削除が完了しました" />}
          />
          <Route path=":factoryId" element={<FactoryDetailPage />} />
          <Route path=":factoryId/edit" element={<FactoryFormPage />} />
        </Route>
        <Route path="staff" element={<StaffManagementProviderOutlet />}>
          <Route index element={<StaffListPage />} />
          <Route path="new" element={<StaffFormPage />} />
          <Route
            path="new/complete"
            element={<StaffCompletePage message="職員情報の新規登録が完了しました" />}
          />
          <Route
            path="deleted"
            element={<StaffCompletePage message="職員情報の削除が完了しました" />}
          />
          <Route path=":staffId" element={<StaffDetailPage />} />
          <Route path=":staffId/edit" element={<StaffFormPage />} />
        </Route>
        <Route path="logs" element={<LogListPage />} />
        <Route path="help" element={<HelpPage />} />
        <Route path="help/:faqId" element={<HelpFaqDetailPage />} />
        <Route path="guide/screens" element={<ScreenCanvasPage />} />
        <Route path="guide/feedback" element={<FeedbackManagementPage />} />
        <Route path="account" element={<AccountPage />} />
        <Route path="account/password" element={<PasswordChangePage />} />
        <Route path="account/password/complete" element={<PasswordChangeCompletePage />} />
        <Route path="account/email" element={<EmailChangePage />} />
        <Route path="account/email/complete" element={<EmailChangeCompletePage />} />
        <Route path="devices" element={<DeviceListPage />} />
        <Route path="devices/deleted" element={<DeviceCompletePage />} />
        <Route path="storage" element={<StorageManagementProviderOutlet />}>
          <Route index element={<StorageListPage />} />
          <Route path="new" element={<StorageFormPage />} />
          <Route
            path="new/complete"
            element={<StorageCompletePage message="保管場所の新規登録が完了しました" />}
          />
          <Route
            path="deleted"
            element={<StorageCompletePage message="保管場所の削除が完了しました" />}
          />
          <Route path=":locationId" element={<StorageDetailPage />} />
          <Route path=":locationId/edit" element={<StorageFormPage />} />
        </Route>
        {adminPlaceholderRoutes.map((item) => (
          <Route
            key={item.path}
            path={item.path.replace("/admin/", "")}
            element={<ComingSoonPage title={item.label} />}
          />
        ))}
      </Route>

      <Route path="/app" element={<AppLayout />}>
        <Route index element={<Navigate to="ledger-list" replace />} />
        <Route path="ledger-list" element={<LedgerListPage />} />
        <Route element={<AppEquipmentInspectionProviderOutlet />}>
          <Route path="ledger-list/equipment-inspection" element={<AppEquipmentLineSelectionPage />} />
          {/* 見送り時に「明日に見送る：いいえ」を選んだ翌日の状態（毎週の点検予定が無くなる） */}
          <Route
            path="ledger-list/equipment-inspection/next-day"
            element={<AppEquipmentLineSelectionPage nextDay />}
          />
          <Route path="ledger-list/equipment-inspection/lines/:lineId" element={<AppLineInspectionPage />} />
          <Route
            path="ledger-list/equipment-inspection/lines/:lineId/confirm"
            element={<AppEquipmentConfirmPage />}
          />
          <Route
            path="ledger-list/equipment-inspection/lines/:lineId/skip-confirm"
            element={<AppEquipmentSkipConfirmPage />}
          />
          <Route
            path="ledger-list/equipment-inspection/lines/:lineId/complete"
            element={<AppEquipmentSubmitCompletePage />}
          />
          <Route element={<SensoryScheduleProviderOutlet />}>
            <Route path="schedule" element={<AppEquipmentSchedulePage />} />
            <Route
              path="schedule/equipment-inspection/:dateKey"
              element={<AppEquipmentSchedulePointSettingPage />}
            />
            <Route
              path="schedule/sensory-inspection/:dateKey"
              element={<AppSensoryScheduleRegisterPage />}
            />
          </Route>
        </Route>
        <Route element={<AppCleaningRecordProviderOutlet />}>
          <Route path="ledger-list/cleaning-record" element={<AppCleaningLineSelectionPage />} />
          {/* 見送り時に「明日に見送る：いいえ」を選んだ翌日の状態（毎週の清掃予定が無くなる） */}
          <Route
            path="ledger-list/cleaning-record/next-day"
            element={<AppCleaningLineSelectionPage nextDay />}
          />
          <Route
            path="ledger-list/cleaning-record/lines/:lineId"
            element={<AppCleaningRecordingPage />}
          />
          <Route
            path="ledger-list/cleaning-record/lines/:lineId/confirm"
            element={<AppCleaningConfirmPage />}
          />
          <Route
            path="ledger-list/cleaning-record/lines/:lineId/skip-confirm"
            element={<AppCleaningSkipConfirmPage />}
          />
          <Route
            path="ledger-list/cleaning-record/lines/:lineId/complete"
            element={<AppCleaningSubmitCompletePage />}
          />
        </Route>
        <Route element={<GlassPlasticProviderOutlet />}>
          <Route path="ledger-list/glass-plastic" element={<AppGlassPlasticFloorSelectionPage />} />
          <Route
            path="ledger-list/glass-plastic/floors/:floorId"
            element={<AppGlassPlasticFloorInspectionPage />}
          />
          <Route
            path="ledger-list/glass-plastic/floors/:floorId/confirm"
            element={<AppGlassPlasticFloorInspectionConfirmPage />}
          />
          <Route
            path="ledger-list/glass-plastic/floors/:floorId/complete"
            element={<AppGlassPlasticFloorInspectionCompletePage />}
          />
        </Route>
        <Route element={<ScaleInspectionProviderOutlet />}>
          <Route path="ledger-list/scale-inspection" element={<AppScaleInspectionPostSelectionPage />} />
          <Route path="ledger-list/scale-inspection/posts/:postId" element={<AppScaleInspectionScaleListPage />} />
          <Route
            path="ledger-list/scale-inspection/posts/:postId/scales/:scaleId"
            element={<AppScaleInspectionScaleRecordPage />}
          />
          <Route
            path="ledger-list/scale-inspection/posts/:postId/confirm"
            element={<AppScaleInspectionConfirmPage />}
          />
          <Route
            path="ledger-list/scale-inspection/posts/:postId/complete"
            element={<AppScaleInspectionSubmitCompletePage />}
          />
          <Route
            path="ledger-list/scale-inspection/posts/:postId/review"
            element={<AppScaleInspectionScaleReviewPage />}
          />
          <Route
            path="ledger-list/scale-inspection/posts/:postId/scales/:scaleId/review"
            element={<AppScaleInspectionScaleDetailPage />}
          />
        </Route>
        <Route element={<SensoryInspectionProviderOutlet />}>
          <Route path="ledger-list/sensory-inspection" element={<AppSensoryProductSelectionPage />} />
          <Route
            path="ledger-list/sensory-inspection/products/:productId"
            element={<AppSensoryRecordPage />}
          />
          <Route
            path="ledger-list/sensory-inspection/products/:productId/confirm"
            element={<AppSensoryConfirmPage />}
          />
          <Route
            path="ledger-list/sensory-inspection/products/:productId/complete"
            element={<AppSensorySubmitCompletePage />}
          />
          <Route
            path="ledger-list/sensory-inspection/products/:productId/review"
            element={<AppSensoryReviewPage />}
          />
        </Route>
        <Route path="ledger-list/water-inspection" element={<AppWaterInspectionProviderOutlet />}>
          <Route index element={<AppWaterPointSelectionPage />} />
          <Route path="points/:pointId" element={<AppWaterPointHistoryTablePage />} />
          <Route path="points/:pointId/new" element={<AppWaterNewRecordPage />} />
          <Route path="points/:pointId/new/confirm" element={<AppWaterNewRecordConfirmPage />} />
          <Route path="complete" element={<AppWaterNewRecordSubmitCompletePage />} />
          <Route path="points/:pointId/records/:recordId" element={<AppWaterPointDetailPage />} />
          <Route
            path="points/:pointId/records/:recordId/edit"
            element={<AppWaterRecordEditPage />}
          />
          <Route
            path="points/:pointId/records/:recordId/edit/confirm"
            element={<AppWaterRecordEditConfirmPage />}
          />
          <Route
            path="points/:pointId/records/:recordId/edit/complete"
            element={<AppWaterRecordEditCompletePage />}
          />
        </Route>
        <Route path="ledger-list/sample-management" element={<AppSampleListPage />} />
        <Route
          path="ledger-list/sample-management/samples/:sampleId"
          element={<AppSampleInspectionPage />}
        />
        <Route
          path="ledger-list/sample-management/samples/:sampleId/confirm"
          element={<AppSampleConfirmPage />}
        />
        <Route
          path="ledger-list/sample-management/samples/:sampleId/complete"
          element={<AppSampleSubmitCompletePage />}
        />
        <Route
          path="ledger-list/sample-management/stored/:storedId"
          element={<AppStoredSampleDetailPage />}
        />
        <Route path="ledger-list/specimen-management" element={<AppSpecimenListPage />} />
        <Route
          path="ledger-list/specimen-management/specimens/:specimenId/confirm"
          element={<AppSpecimenManagementConfirmPage />}
        />
        <Route
          path="ledger-list/metal-xray-detection"
          element={<AppMetalXrayMachineSelectionPage />}
        />
        <Route
          path="ledger-list/metal-xray-detection/machines/:machineId"
          element={<AppMetalXrayMachineDetailPage />}
        />
        <Route
          path="ledger-list/metal-xray-detection/machines/:machineId/new"
          element={<AppMetalXrayMachineRecordFormPage />}
        />
        <Route
          path="ledger-list/metal-xray-detection/machines/:machineId/confirm"
          element={<AppMetalXrayMachineConfirmPage />}
        />
        <Route
          path="ledger-list/metal-xray-detection/machines/:machineId/confirm/:recordId"
          element={<AppMetalXrayMachineRecordDetailPage />}
        />
        <Route
          path="ledger-list/metal-xray-detection/machines/:machineId/records/:recordId"
          element={<AppMetalXrayMachineRecordDetailPage />}
        />
        <Route
          path="ledger-list/metal-xray-detection/machines/:machineId/review"
          element={<AppMetalXrayMachineReviewPage />}
        />
        <Route
          path="ledger-list/metal-xray-detection/machines/:machineId/complete"
          element={<AppMetalXrayMachineSubmitCompletePage />}
        />
        <Route element={<AppAdditiveManagementProviderOutlet />}>
          <Route path="ledger-list/additive-management" element={<AppAdditiveProductSelectionPage />} />
          <Route
            path="ledger-list/additive-management/products/:productId"
            element={<AppAdditiveRecordsListPage />}
          />
          <Route
            path="ledger-list/additive-management/products/:productId/new"
            element={<AppAdditiveRecordingPage />}
          />
          <Route
            path="ledger-list/additive-management/products/:productId/confirm"
            element={<AppAdditiveConfirmPage />}
          />
          <Route
            path="ledger-list/additive-management/products/:productId/complete"
            element={<AppAdditiveSubmitCompletePage />}
          />
          <Route
            path="ledger-list/additive-management/products/:productId/records/:recordId"
            element={<AppAdditiveRecordDetailPage />}
          />
        </Route>
        <Route element={<AppChemicalManagementProviderOutlet />}>
          <Route path="ledger-list/chemical-management" element={<AppChemicalSelectionPage />} />
          <Route
            path="ledger-list/chemical-management/:chemicalId"
            element={<AppChemicalRecordsListPage />}
          />
          <Route
            path="ledger-list/chemical-management/:chemicalId/new"
            element={<AppChemicalRecordingPage />}
          />
          <Route
            path="ledger-list/chemical-management/:chemicalId/records/:recordId"
            element={<AppChemicalRecordDetailPage />}
          />
          <Route
            path="ledger-list/chemical-management/:chemicalId/confirm"
            element={<AppChemicalConfirmPage />}
          />
          <Route
            path="ledger-list/chemical-management/:chemicalId/confirm/complete"
            element={<AppChemicalSubmitCompletePage />}
          />
        </Route>
        <Route path="ledger-list/:slug" element={<AppLedgerDetailPage />} />
        <Route path="progress" element={<ProgressListPage />} />
        <Route path="pending-review" element={<PendingReviewListPage />} />
        <Route path="pending-review/:id" element={<PendingReviewDetailPage />} />
        <Route path="settings" element={<AppSettingsPage />} />
        <Route path="settings/license" element={<AppLicensePage />} />
        <Route path="text-size" element={<AppTextSizePage />} />
        <Route path="help" element={<AppHelpPage />} />
        {appPlaceholderRoutes.map((item) => (
          <Route
            key={item.path}
            path={item.path.replace("/app/", "")}
            element={<ComingSoonPage title={item.label} />}
          />
        ))}
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
    <PageDescriptionButton />
    <FeedbackWidget />
    </>
  );
}

export default App;

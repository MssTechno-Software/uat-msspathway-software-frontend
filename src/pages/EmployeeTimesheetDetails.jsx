import EmployeeTimesheetManager from 
"../container/admintimesheetmanagement/EmployeeTimesheetSections/EmployeeTimesheetManager";

// Page entry: connects the route to the timesheet manager.
export default function EmployeeTimesheetPage(props) {
  return <EmployeeTimesheetManager {...props} />;
}
List positions
const { data: positions } = useListPositions();
Get single position
const { data: position } = useGetPosition(5);
Create position
createPosition.mutate({
  title: "Senior Engineer",
  department_id: 2,
  reports_to_position_id: 1
});
Update
updatePosition.mutate({
  id: 5,
  data: {
    title: "Lead Engineer",
    department_id: 2,
    reports_to_position_id: 1
  }
});
Delete
deletePosition.mutate(5);

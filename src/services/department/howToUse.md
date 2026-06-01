const { data, isLoading } = useListDepartments();

*************************************************************
**************************************************

const createDepartment = useCreateDepartment();

createDepartment.mutate({
  name: "IT",
  code: "IT"
});

******************
*********************

updateDepartment.mutate({
  id: 1,
  data: {
    name: "Finance",
    code: "FIN"
  }
});

***********
**********

deleteDepartment.mutate(1);
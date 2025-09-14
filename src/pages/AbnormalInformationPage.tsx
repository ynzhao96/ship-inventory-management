import { useEffect } from "react";
import { getAbnormals } from "../services/getAbnormals";

const AbnormalInformationPage = () => {
  useEffect(() => {
    const res = getAbnormals();
    console.log(res);
  }, []);

  return (
    <></>
  )
}

export default AbnormalInformationPage;
import {
  Box,
  Flex,
  Tbody,
  Td,
  Thead,
  Tr,
  useColorMode,
  Text,
  Image,
  Center,
  Icon,
  IconButton,
  Button,
  useColorModeValue,
} from "@chakra-ui/react";
import CustomTableContainer from "@src/new/components/CustomTableContainer";
import CustomTh from "@src/new/components/CustomTh";
import {
  activeCartDetailsSelector,
  activeCartItemsSelector,
  localPayedSelector,
  removePayment,
} from "@src/shared/redux/reducers/basketReducer";
import { useAppDispatch, useAppSelector } from "@src/shared/redux/types";
import { numberWithCommas } from "@src/utils/helpers";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import PaymentItem from "../../Payment/components/PaymentItem";
import BasketCartItem from "@src/new/components/BasketCartItem";
import usePermissionCheck from "@src/shared/hooks/usePermissionCheck";
import PermissionModal from "@src/new/components/PermissionModal";
import { Permission } from "@src/shared/types";
import NoPayments from "@assets/icons/noPayments.svg";
import { MdDeleteSweep, MdQrCode, MdWifi } from "react-icons/md";

import { ArrowBackIcon } from "@chakra-ui/icons";
import useOfflineSync from "@src/utils/hooks/useOfflineSync";
import useNetworkStatus from "@src/utils/hooks/useNetworkStatus";
import { fiscalModuleSelector, setFiscal } from "@src/shared/redux/reducers/settingsReducer";

const PaymentList = () => {
  const { colorMode } = useColorMode();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { scanModal, checkPermissionAndExecute, close: handleClose } = usePermissionCheck();
  const { payments: localPayments } = useAppSelector(activeCartDetailsSelector);
  const { isFetching: offlineFetching, refetch } = useOfflineSync();
  const fiscalEnabled = useAppSelector(fiscalModuleSelector);

  const isOnline = useNetworkStatus();

  const primary500 = useColorModeValue("primary.500", "blue.500");

  const payedAmount = useAppSelector(localPayedSelector);

  const activeCartItems = useAppSelector(activeCartItemsSelector);

  const deletePayment = (index: number) => () => {
    checkPermissionAndExecute(Permission.CashboxPaymentDeletePayment, () =>
      dispatch(removePayment({ index })),
    );
  };

  const deeleteAll = () => {
    checkPermissionAndExecute(Permission.CashboxPaymentDeletePayment, () => {
      localPayments.forEach((_, index) => dispatch(removePayment({ index })));
    });
  };

  const toggleFiscal = () => {
    checkPermissionAndExecute(Permission.CashboxFiscalModule, () =>
      dispatch(setFiscal(!fiscalEnabled)),
    );
  };

  const goBack = () => {
    navigate(-1);
  };

  return (
    <Box flex={1} display={"flex"} flexDirection={"column"}>
      {scanModal && <PermissionModal onClose={handleClose} />}

      <Box
        maxH={"40vh"}
        overflow={"auto"}
        mb={"1.5rem"}
        borderRadius={"6px"}
        bg={colorMode === "dark" ? "componentColor.500" : "white"}>
        <Flex alignItems="center" pb={"0.5rem"} pt="1rem" px={"1rem"}>
          <Flex flex={1} alignItems="center" gap="1rem">
            <IconButton
              size={"lg"}
              aria-label="back"
              bg={colorMode === "dark" ? "bgDark.500" : "gray1.500"}
              icon={
                <ArrowBackIcon
                  color={colorMode === "dark" ? "white" : "primary.500"}
                  w={"1.5rem"}
                  h={"1.5rem"}
                />
              }
              onClick={goBack}
            />
            <Text
              fontSize={"1.25rem"}
              fontWeight={"medium"}
              color={colorMode === "dark" ? "white" : "gray.1000"}>
              {t("cartProducts")}
            </Text>
          </Flex>

          <Flex gap={"0.5rem"} alignItems="center" pr="0.5rem">
            <Button
              w={"3.25rem"}
              h={"3.25rem"}
              color={"white"}
              onClick={() => {
                if (isOnline) {
                  refetch();
                }
              }}
              isLoading={offlineFetching}
              colorScheme={isOnline ? "themeGreen" : "primary"}
              bg={isOnline ? "themeGreen.500" : "gray.500"}>
              <Icon as={MdWifi} w={"1.5rem"} h={"1.5rem"} />
            </Button>
            <Button
              w={"3.25rem"}
              h={"3.25rem"}
              color={"white"}
              onClick={toggleFiscal}
              // colorScheme={fiscalEnabled ? "themeGreen" : "primary"}
              bg={fiscalEnabled ? "themeGreen.500" : primary500}>
              <Icon as={MdQrCode} w={"1.5rem"} h={"1.5rem"} />
            </Button>
          </Flex>
        </Flex>

        <CustomTableContainer minH="0" product tableStyle={{ border: "none" }}>
          <Tbody w={"100%"}>
            <Tr>
              <Td p={0}></Td>
              <Td p={0}></Td>
              <Td p={0}></Td>
            </Tr>
            {activeCartItems?.map((item, i) => (
              <BasketCartItem data={item} key={`${item.id}_${i}`} index={i} isClosed />
            ))}
          </Tbody>
        </CustomTableContainer>
      </Box>
      <Box
        flex={1}
        bg={colorMode === "dark" ? "componentColor.500" : "white"}
        pos={"relative"}
        borderRadius={"6px"}>
        {!localPayments?.length ? (
          <Flex
            flexDir={"column"}
            align={"center"}
            pos={"absolute"}
            top={"50%"}
            left={"50%"}
            transform={"translate(-50%, -50%)"}>
            <Image src={NoPayments} mb={"1.5rem"} w={"9.5rem"} h={"8.25rem"} />
            <Text
              fontSize={"1.25rem"}
              fontWeight={"medium"}
              textAlign={"center"}
              color={colorMode === "dark" ? "white" : "gray.1000"}>
              {t("noPaymentsText")}
            </Text>
          </Flex>
        ) : (
          <CustomTableContainer minH="0" w="auto" tableStyle={{ border: "none" }}>
            <Thead>
              <Tr>
                <CustomTh>{t("paymentDetails")}</CustomTh>
                <CustomTh justify="space-between" style={{ width: "100%" }}>
                  {t("amount")}
                </CustomTh>
                <CustomTh></CustomTh>
              </Tr>
            </Thead>
            <Tbody>
              {localPayments.map((payment, i) => (
                <PaymentItem
                  key={i + "payment" + payment?.payment_id}
                  title={payment?.payment_id && t(payment.payment_id)}
                  price={`${numberWithCommas(payment.amount / 100)} UZS`}
                  paymentId={payment?.payment_id}
                  action={deletePayment(i)}
                />
              ))}

              <Tr>
                <Td
                  color={colorMode === "dark" ? "white" : "#2D3748"}
                  fontSize={"1.25rem"}
                  fontWeight={"bold"}
                  borderBottom={0}>
                  {t("total")}
                </Td>
                <Td
                  color={colorMode === "dark" ? "white" : "#2D3748"}
                  fontSize={"1.25rem"}
                  fontWeight={"bold"}
                  borderBottom={0}>
                  {numberWithCommas(payedAmount / 100)} UZS
                </Td>
                <Td py={"0.3125rem"} borderBlock={"none"} w={"2.5rem"}>
                  <Box display={"flex"} alignItems={"center"} justifyContent={"flex-end"}>
                    <Center
                      cursor={"pointer"}
                      w={"2.5rem"}
                      h={"2.5rem"}
                      borderRadius={"4px"}
                      bg={"gray.300"}
                      onClick={deeleteAll}
                      color={colorMode === "dark" ? "blue.500" : "primary.500"}>
                      <Icon as={MdDeleteSweep} w={"1.5rem"} h={"1.5rem"} />
                    </Center>
                  </Box>
                </Td>
              </Tr>
            </Tbody>
          </CustomTableContainer>
        )}
      </Box>
    </Box>
  );
};

export default PaymentList;

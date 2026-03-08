// import { CheckCircle, Info, XCircle } from "lucide-react-native";
// import { Text, View } from "react-native";
// import Toast, { ToastConfig } from "react-native-toast-message";

// // ─── Custom toast UI ──────────────────────────────────────────────────────────

// interface ToastBodyProps {
//     text1?: string;
//     text2?: string;
//     icon: React.ReactNode;
//     barColor: string;
// }

// function ToastBody({ text1, text2, icon, barColor }: ToastBodyProps) {
//     return (
//         <View
//             className="flex-row items-center mx-4 rounded-2xl bg-zinc-900 border border-zinc-800 px-4 py-3 gap-3"
//             style={{
//                 shadowColor: "#000",
//                 shadowOffset: { width: 0, height: 4 },
//                 shadowOpacity: 0.35,
//                 shadowRadius: 10,
//                 elevation: 8,
//                 borderLeftWidth: 3,
//                 borderLeftColor: barColor,
//                 minHeight: 52,
//             }}
//         >
//             <View className="shrink-0">{icon}</View>
//             <View className="flex-1">
//                 {text1 ? (
//                     <Text className="text-white text-sm font-semibold" numberOfLines={1}>
//                         {text1}
//                     </Text>
//                 ) : null}
//                 {text2 ? (
//                     <Text className="text-zinc-400 text-xs mt-0.5" numberOfLines={2}>
//                         {text2}
//                     </Text>
//                 ) : null}
//             </View>
//         </View>
//     );
// }

// // ─── Toast config ─────────────────────────────────────────────────────────────

// export const toastConfig: ToastConfig = {
//     success: ({ text1, text2 }) => (
//         <ToastBody
//             text1={text1}
//             text2={text2}
//             barColor="#22c55e"
//             icon={<CheckCircle size={20} color="#22c55e" />}
//         />
//     ),
//     error: ({ text1, text2 }) => (
//         <ToastBody
//             text1={text1}
//             text2={text2}
//             barColor="#ef4444"
//             icon={<XCircle size={20} color="#ef4444" />}
//         />
//     ),
//     info: ({ text1, text2 }) => (
//         <ToastBody
//             text1={text1}
//             text2={text2}
//             barColor="#fbbf24"
//             icon={<Info size={20} color="#fbbf24" />}
//         />
//     ),
// };

// // ─── Convenience hook ─────────────────────────────────────────────────────────

// type ToastType = "success" | "error" | "info";

// interface ShowToastOptions {
//     type?: ToastType;
//     title: string;
//     message?: string;
//     /** Duration in ms — default 3500 */
//     duration?: number;
// }

// export function useToast() {
//     const show = ({ type = "info", title, message, duration = 3500 }: ShowToastOptions) => {
//         Toast.show({
//             type,
//             text1: title,
//             text2: message,
//             visibilityTime: duration,
//             position: "bottom",
//         });
//     };

//     const success = (title: string, message?: string) =>
//         show({ type: "success", title, message });

//     const error = (title: string, message?: string) =>
//         show({ type: "error", title, message });

//     const info = (title: string, message?: string) =>
//         show({ type: "info", title, message });

//     return { show, success, error, info };
// }

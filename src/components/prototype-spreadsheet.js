// components/prototype-spreadsheet.js
'use client';

import { HotTable } from '@handsontable/react';
import { useFirstRowStore } from '../store/firstRow_store';
import 'handsontable/dist/handsontable.full.css';

import 'handsontable/styles/handsontable.min.css';
import 'handsontable/styles/ht-theme-main.min.css';

// 스프레드시트 컴포넌트
export const PrototypeSpreadsheet = ({ data, setData, hotRef }) => {
    const settings = {
        data,
        rowHeaders: true,
        colHeaders: true,
        contextMenu: true,
        manualRowMove: true,
        manualColumnMove: true,
        manualRowResize: true,
        manualColumnResize: true,
        filters: true,
        dropdownMenu: true,
        copyPaste: true,
        formulas: {
            engine: 'hyperformula'
        },
        afterChange: (changes) => {
            if (changes) {
                const instance = hotRef?.current?.hotInstance;
                if (instance) {
                    setData(instance.getData());
                }
            }
        },
        licenseKey: 'non-commercial-and-evaluation'
    };

    return (
        <div className="h-full overflow-auto">
            <HotTable ref={hotRef} settings={settings} />
        </div>
    );
};

// 채팅 UI 컴포넌트
export const ChatInterface = ({ command, setCommand, onSubmit, loading, history, currentHeaders }) => {
    return (
        <div className="flex flex-col h-full">
            {/* 헤더 */}
            <div className="p-4 border-b bg-gray-50">
                <h3 className="font-semibold">AI 명령어</h3>
                {currentHeaders.length > 0 && (
                    <p className="text-xs text-gray-500 mt-1">
                        현재 헤더: {currentHeaders.join(', ')}
                    </p>
                )}
            </div>

            {/* 채팅 히스토리 */}
            <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
                {history.length === 0 ? (
                    <div className="text-center text-gray-500 mt-8">
                        <p className="text-sm">명령어를 입력해보세요.</p>
                        <p className="text-xs mt-2">예: "키 순으로 정렬해줘", "평균값 계산해줘"</p>
                    </div>
                ) : (
                    history.map(message => (
                        <div
                            key={message.id}
                            className={`mb-4 p-3 rounded-lg ${message.type === 'user'
                                    ? 'bg-blue-100 ml-auto max-w-[80%]'
                                    : 'bg-white border max-w-[80%]'
                                }`}
                        >
                            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                            {message.formula && (
                                <code className="text-xs bg-gray-100 px-2 py-1 rounded mt-2 block">
                                    {message.formula}
                                </code>
                            )}
                            <small className="text-xs text-gray-500 mt-1 block">
                                {message.timestamp.toLocaleTimeString()}
                            </small>
                        </div>
                    ))
                )}
            </div>

            {/* 입력창 */}
            <div className="p-4 border-t bg-white">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={command}
                        onChange={(e) => setCommand(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && !loading && onSubmit()}
                        placeholder="명령어를 입력하세요..."
                        className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled={loading}
                    />
                    <button
                        onClick={onSubmit}
                        disabled={loading || !command.trim()}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400 transition-colors"
                    >
                        {loading ? '처리중...' : '전송'}
                    </button>
                </div>
            </div>
        </div>
    );
};

// 헤더 편집기 컴포넌트
export const HeaderEditor = () => {
    const { headers, updateHeader } = useFirstRowStore();

    return (
        <div className="p-4 bg-yellow-50 border-b">
            <h3 className="font-semibold mb-2">헤더 편집</h3>
            <div className="flex flex-wrap gap-2">
                {headers.map((header, index) => (
                    <div key={index} className="flex items-center gap-1">
                        <span className="text-sm text-gray-600">{index + 1}:</span>
                        <input
                            type="text"
                            value={header}
                            onChange={(e) => updateHeader(index, e.target.value)}
                            className="px-2 py-1 text-sm border rounded"
                        />
                    </div>
                ))}
            </div>
        </div>
    );
};

// 파일 업로드 컴포넌트
export const FileControls = ({ onFileUpload, onDownload, onToggleHeaderEditor }) => {
    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            onFileUpload(file);
        }
    };

    return (
        <div className="flex justify-between items-center p-4 bg-white border-b">
            <h1 className="text-xl font-bold text-gray-800">AI 스프레드시트 프로토타입</h1>

            <div className="flex gap-2">
                <label className="px-4 py-2 bg-gray-100 rounded-lg cursor-pointer hover:bg-gray-200 transition-colors">
                    <input
                        type="file"
                        accept=".csv"
                        onChange={handleFileChange}
                        className="hidden"
                    />
                    📁 파일 업로드
                </label>
                <button
                    onClick={onDownload}
                    className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                    💾 CSV 다운로드
                </button>
                <button
                    onClick={onToggleHeaderEditor}
                    className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                    ✏️ 헤더 편집
                </button>
            </div>
        </div>
    );
};

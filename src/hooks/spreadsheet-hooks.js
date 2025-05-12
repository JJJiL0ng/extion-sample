// hooks/spreadsheet-hooks.js
import { useState, useCallback, useRef } from 'react';
import { parseCSV, downloadCSV } from '../lib/spreadsheet-lib';
import { executeHandsontableCommand } from '../lib/command-executor';
import { useFirstRowStore } from '../store/firstRow_store';


// 스프레드시트 데이터 관리 훅
export const useSpreadsheetData = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { setHeaders } = useFirstRowStore();

  const loadFromFile = useCallback(async (file) => {
    setLoading(true);
    setError(null);
    try {
      const parsedData = await parseCSV(file);

      // 첫 행을 헤더로 저장
      if (parsedData.length > 0) {
        const headers = parsedData[0];
        setHeaders(headers);
      }

      setData(parsedData);
    } catch (err) {
      setError(`파일 로드 실패: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, [setHeaders]);

  const downloadAsCSV = useCallback((filename) => {
    downloadCSV(data, filename);
  }, [data]);

  return {
    data,
    setData,
    loading,
    error,
    loadFromFile,
    downloadAsCSV
  };
};

// AI 명령어 처리 훅
export const useAICommand = () => {
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const { headers } = useFirstRowStore();

  const executeCommand = useCallback(async (command, currentData, handsontableInstance, headerInfo) => {
    setLoading(true);

    // 사용자 메시지 추가
    const userMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: command,
      timestamp: new Date()
    };
    setHistory(prev => [...prev, userMessage]);

    try {
      // API 호출
      const response = await fetch('/api/ai-command', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command, currentData, headerInfo })
      });

      const result = await response.json();

      // 어시스턴트 메시지 추가
      const assistantMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: result.explanation,
        timestamp: new Date(),
        formula: result.formula
      };
      setHistory(prev => [...prev, assistantMessage]);

      // 명령어 실행
      if (result.success && result.command) {
        await executeHandsontableCommand(
          handsontableInstance,
          result.command,
          headers,
          result.targetColumns
        );

        // 성공 메시지 추가
        const successMessage = {
          id: (Date.now() + 2).toString(),
          type: 'assistant',
          content: '✓ 명령어가 성공적으로 실행되었습니다.',
          timestamp: new Date()
        };
        setHistory(prev => [...prev, successMessage]);
      }
    } catch (error) {
      console.error('Error executing command:', error);
      // 에러 메시지 추가
      const errorMessage = {
        id: (Date.now() + 3).toString(),
        type: 'assistant',
        content: `❌ 오류가 발생했습니다: ${error.message}`,
        timestamp: new Date()
      };
      setHistory(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  }, [headers]);

  return {
    loading,
    history,
    executeCommand
  };
};

// Handsontable 인스턴스 관리 훅
export const useHandsontable = () => {
  const hotRef = useRef(null);

  const getInstance = useCallback(() => {
    return hotRef.current?.hotInstance;
  }, []);

  const updateData = useCallback((data) => {
    const instance = getInstance();
    if (instance) {
      instance.loadData(data);
    }
  }, [getInstance]);

  return {
    hotRef,
    getInstance,
    updateData
  };
};

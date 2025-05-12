// lib/command-executor.js
// 명령어 실행 전 검증
export const validateCommand = (command, headers, targetColumns) => {
    if (!command) return false;
  
    // 위험한 패턴 체크
    const dangerousPatterns = [
      /eval\s*\(/,
      /Function\s*\(/,
      /window/,
      /document\./,
      /process\./,
      /import\s/,
      /require\s/,
      /localStorage/,
      /sessionStorage/
    ];
  
    for (const pattern of dangerousPatterns) {
      if (pattern.test(command)) {
        throw new Error('보안상 위험한 명령어가 감지되었습니다.');
      }
    }
  
    // 열 인덱스 유효성 검사
    if (targetColumns) {
      for (const colIndex of targetColumns) {
        if (colIndex >= headers.length || colIndex < 0) {
          throw new Error(`잘못된 열 인덱스: ${colIndex}`);
        }
      }
    }
  
    return true;
  };
  
  // 안전한 명령어 실행
  export const executeHandsontableCommand = async (instance, command, headers, targetColumns) => {
    try {
      // 명령어 검증
      validateCommand(command, headers, targetColumns);
  
      // 명령어 실행 (safe context)
      const safeExecutor = new Function('hot', `
        try {
          ${command}
          return { success: true };
        } catch (error) {
          return { success: false, error: error.message };
        }
      `);
  
      const result = safeExecutor(instance);
  
      if (!result.success) {
        throw new Error(result.error);
      }
  
      return true;
    } catch (error) {
      console.error('명령어 실행 오류:', error);
      throw error;
    }
  };
  
  // 명령어 미리보기 생성
  export const generateCommandPreview = (command, headers, targetColumns) => {
    const affectedHeaders = targetColumns ?
      targetColumns.map(idx => headers[idx] || `열 ${idx}`).join(', ') :
      '전체 시트';
  
    return `이 명령은 다음 열에 영향을 줍니다: ${affectedHeaders}`;
  };
  
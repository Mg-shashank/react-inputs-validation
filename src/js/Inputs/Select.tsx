import * as React from 'react';
const { useState, useEffect, useCallback, useRef, memo } = React;
import message from './message';
import { REACT_INPUTS_VALIDATION_CUSTOM_ERROR_MESSAGE_EXAMPLE, DEFAULT_LOCALE, WRAPPER_CLASS_IDENTITIFIER, CONTAINER_CLASS_IDENTITIFIER, MSG_CLASS_IDENTITIFIER, usePrevious } from './const';
import utils from './utils';
import reactInputsValidationCss from './react-inputs-validation.css';
const TYPE = 'select';
/* istanbul ignore next */
if (!String.prototype.startsWith) {
  String.prototype.startsWith = function(searchString, position) {
    const p = position || 0;
    return this.indexOf(searchString, p) === p;
  };
}
interface DefaultValidationOption {
  name?: string;
  check?: boolean;
  showMsg?: boolean;
  required?: boolean;
  locale?: string;
  msgOnError?: string;
  msgOnSuccess?: string;
}
const getDefaultValidationOption = (obj: DefaultValidationOption) => {
  let { name, check, required, showMsg, locale, msgOnError, msgOnSuccess } = obj;
  locale = typeof locale !== 'undefined' ? locale : DEFAULT_LOCALE;
  name = typeof name !== 'undefined' ? name : '';
  check = typeof check !== 'undefined' ? check : true;
  showMsg = typeof showMsg !== 'undefined' ? showMsg : true;
  required = typeof required !== 'undefined' ? required : true;
  msgOnSuccess = typeof msgOnSuccess !== 'undefined' ? msgOnSuccess : '';
  msgOnError = typeof msgOnError !== 'undefined' ? msgOnError : '';
  return {
    name,
    check,
    showMsg,
    required,
    locale,
    msgOnError,
    msgOnSuccess,
  };
};
interface DefaultAsyncMsgObj {
  error?: boolean;
  message?: string;
  showOnError?: boolean;
  showOnSuccess?: boolean;
}
const getDefaultAsyncObj = (obj: DefaultAsyncMsgObj) => {
  let { error, message, showOnError, showOnSuccess } = obj;
  error = typeof error !== 'undefined' ? error : false;
  message = typeof message !== 'undefined' ? message : '';
  showOnError = typeof showOnError !== 'undefined' ? showOnError : true;
  showOnSuccess = typeof showOnSuccess !== 'undefined' ? showOnSuccess : false;
  return {
    error,
    message,
    showOnError,
    showOnSuccess,
  };
};
export const isValidValue = (list: OptionListItem[], value: any) => {
  let res = false;
  if (list.length) {
    for (let i = 0; i < list.length; i += 1) {
      if (list[i].id === value) {
        res = true;
        break;
      }
    }
  }
  return res;
};
export const getItem = (list: OptionListItem[], value: any) => {
  let res = null;
  if (list.length) {
    for (let i = 0; i < list.length; i += 1) {
      if (list[i].id === value) {
        res = list[i];
        break;
      }
    }
  }
  return res;
};
export const getIndex = (list: OptionListItem[], value: string) => {
  let key = -1;
  for (let i = 0; i < list.length; i += 1) {
    if (list[i].id === value) {
      key = i;
      break;
    }
  }
  return key;
};
interface OptionListItem {
  id: string;
  name: string;
}
interface Props {
  tabIndex?: string | number | null;
  id?: string | null;
  name?: string;
  value?: string | number;
  disabled?: boolean;
  validate?: boolean;
  optionList: OptionListItem[];
  onChange: (res: string, e: React.MouseEvent<HTMLElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLElement> | Event) => void;
  onFocus?: (e: React.FocusEvent<HTMLElement>) => void;
  onClick?: (e: React.MouseEvent<HTMLElement>) => void;
  validationOption?: object;
  asyncMsgObj?: object;
  selectHtml?: React.ReactNode;
  selectOptionListItemHtml?: React.ReactNode;
  classNameWrapper?: string;
  classNameContainer?: string;
  classNameSelect?: string;
  classNameOptionListContainer?: string;
  classNameDropdownIconOptionListItem?: string;
  classNameOptionListItem?: string;
  customStyleWrapper?: object;
  customStyleContainer?: object;
  customStyleSelect?: object;
  customStyleOptionListContainer?: object;
  customStyleDropdownIcon?: object;
  customStyleOptionListItem?: object;
  validationCallback?: (res: boolean) => void;
}
interface Node {
  [key: string]: any;
}
let globalVariableIsFocusing: boolean = false;
let globalVariableIsCorrected: boolean = false;
let globalVariableCurrentFocus: any | null = null;
let globalVariableTypingTimeout: any | null = null;
const component: React.FC<Props> = ({
  tabIndex = null,
  id = null,
  name = '',
  value = '',
  disabled = false,
  validate = false,
  optionList = [],
  classNameWrapper = '',
  classNameContainer = '',
  classNameSelect = '',
  classNameOptionListItem = '',
  classNameOptionListContainer = '',
  classNameDropdownIconOptionListItem = '',
  customStyleWrapper = {},
  customStyleContainer = {},
  customStyleSelect = {},
  customStyleOptionListItem = {},
  customStyleOptionListContainer = {},
  customStyleDropdownIcon = {},
  validationOption = {},
  asyncMsgObj = {},
  selectHtml = null,
  selectOptionListItemHtml = null,
  onChange = () => {},
  onBlur = null,
  onFocus = null,
  onClick = null,
  validationCallback = null,
}) => {
  const [err, setErr] = useState(false);
  const [msg, setMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [internalValue, setInternalValue] = useState(String(value));
  const prevInternalValue = usePrevious(internalValue);
  const [show, setShow] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const initKeycodeList: number[] = [];
  const [keycodeList, setKeycodeList] = useState(initKeycodeList);
  const option = getDefaultValidationOption(validationOption);
  const asyncObj = getDefaultAsyncObj(asyncMsgObj);
  const $wrapper = useRef(null);
  const $itemsWrapper = useRef(null);
  const $elWrapper: { [key: string]: any } | null = $wrapper;
  const $elItemsWrapper: { [key: string]: any } | null = $itemsWrapper;
  const $itemsRef: { [key: string]: any } = [];
  if (optionList.length) {
    for (let i = 0; i < optionList.length; i += 1) {
      $itemsRef.push(useRef(null));
    }
  }
  const handleOnBlur = useCallback(
    (e: React.FocusEvent<HTMLElement> | Event) => {
      if (onBlur) {
        check();
        onBlur(e);
      }
    },
    [internalValue],
  );
  const handleOnFocus = useCallback((e: React.FocusEvent<HTMLElement>) => {
    if (onFocus) {
      onFocus(e);
    }
  }, []);
  const handleOnClick = useCallback((e: React.MouseEvent<HTMLElement>) => {
    if (onClick) {
      onClick(e);
    }
  }, []);
  const handleOnChange = useCallback((v: string, e: React.MouseEvent<HTMLElement>) => {
    if (disabled || $elWrapper === null) {
      return;
    }
    onChange && onChange(String(v), e);
  }, []);
  const check = useCallback(
    () => {
      const { name, check, locale, required, msgOnSuccess } = option;
      if (!check) {
        return;
      }
      if (!message[locale] || !message[locale][TYPE]) {
        console.error(REACT_INPUTS_VALIDATION_CUSTOM_ERROR_MESSAGE_EXAMPLE);
        return;
      }
      if (required) {
        const msg = message[locale][TYPE];
        const nameText = name ? name : '';
        if (!isValidValue(optionList, internalValue) || internalValue === '' || internalValue === 'null' || internalValue === 'undefined') {
          handleCheckEnd(true, msg.empty(nameText));
          return;
        }
      }
      if (msgOnSuccess) {
        setSuccessMsg(msgOnSuccess);
      }
      handleCheckEnd(false, msgOnSuccess);
    },
    [internalValue, option],
  );
  const handleCheckEnd = useCallback((err: boolean, message: string) => {
    let msg = message;
    const { msgOnError } = option;
    if (err && msgOnError) {
      msg = msgOnError;
    }
    setErr(err);
    setMsg(msg);
    validationCallback && validationCallback(err);
  }, []);
  /* istanbul ignore next because of https://github.com/airbnb/enzyme/issues/441 && https://github.com/airbnb/enzyme/blob/master/docs/future.md */
  useEffect(() => {
    if ($elWrapper === null) {
      return;
    }
    window.addEventListener('mousedown', pageClick);
    window.addEventListener('touchstart', pageClick);
    if (id) {
      $elWrapper.current.setAttribute('id', String(id));
    }
    if (tabIndex) {
      $elWrapper.current.setAttribute('tabindex', String(tabIndex));
    }
    return () => {
      window.removeEventListener('mousedown', pageClick);
      window.removeEventListener('touchstart', pageClick);
      $elWrapper.current.removeEventListener('keydown', onKeyDown);
    };
  }, []);
  /* istanbul ignore next because of https://github.com/airbnb/enzyme/issues/441 && https://github.com/airbnb/enzyme/blob/master/docs/future.md */
  const pageClick = useCallback((e: Event) => {
    if ($elWrapper === null || $elWrapper.current.contains(e.target)) {
      return;
    }
    if (globalVariableIsFocusing) {
      handleOnBlur(e);
      globalVariableIsFocusing = false;
    }
    setShow(false);
  }, []);
  /* istanbul ignore next because of https://github.com/airbnb/enzyme/issues/441 && https://github.com/airbnb/enzyme/blob/master/docs/future.md */
  const resetCurrentFocus = useCallback(
    () => {
      globalVariableCurrentFocus = getIndex(optionList, internalValue);
      scroll();
    },
    [internalValue],
  );
  /* istanbul ignore next because of https://github.com/airbnb/enzyme/issues/441 && https://github.com/airbnb/enzyme/blob/master/docs/future.md */
  const setTimeoutTyping = useCallback(() => {
    if (globalVariableTypingTimeout) {
      clearTimeout(globalVariableTypingTimeout);
    }
    globalVariableTypingTimeout = setTimeout(() => {
      setKeycodeList([]);
    }, 250);
  }, []);
  /* istanbul ignore next because of https://github.com/airbnb/enzyme/issues/441 && https://github.com/airbnb/enzyme/blob/master/docs/future.md */
  const scroll = useCallback((direction: undefined | string = undefined) => {
    if ($elItemsWrapper === null) {
      return;
    }
    const containerHeight = $elItemsWrapper.current.offsetHeight;
    const containerScrollTop = $elItemsWrapper.current.scrollTop;
    if (!globalVariableCurrentFocus || !$itemsRef[globalVariableCurrentFocus]) {
      return;
    }
    const $elOptionItem: Node | null = $itemsRef[globalVariableCurrentFocus];
    if ($elOptionItem === null) {
      return;
    }
    const itemHeight = $elOptionItem.current.offsetHeight;
    if (direction) {
      if (direction === 'down') {
        const bound = containerScrollTop + containerHeight;
        const heightItems = globalVariableCurrentFocus * itemHeight;
        const heightContainer = bound - itemHeight;
        if (heightItems >= heightContainer) {
          const offset = Math.abs(heightItems - heightContainer - itemHeight);
          if (offset >= 0 && !globalVariableIsCorrected) {
            $elItemsWrapper.current.scrollTop = containerScrollTop + itemHeight - offset;
            globalVariableIsCorrected = true;
          } else {
            $elItemsWrapper.current.scrollTop = containerScrollTop + itemHeight;
          }
        }
      }
      if (direction === 'up') {
        globalVariableIsCorrected = false;
        if (globalVariableCurrentFocus * itemHeight <= containerScrollTop) {
          $elItemsWrapper.current.scrollTop = globalVariableCurrentFocus * itemHeight;
        }
      }
    } else {
      globalVariableIsCorrected = false;
      $elItemsWrapper.current.scrollTop = globalVariableCurrentFocus * itemHeight;
    }
  }, []);
  const handleOnItemClick = useCallback((v: string, e: React.MouseEvent<HTMLElement>) => {
    handleOnChange(v, e);
  }, []);
  const handleOnItemMouseOver = useCallback((index: number) => {
    globalVariableCurrentFocus = index;
    addActive();
  }, []);
  const handleOnItemMouseMove = useCallback(() => {
    setIsTyping(false);
  }, []);
  const handleOnItemMouseOut = useCallback(() => {
    removeActive();
  }, []);
  const addActive = useCallback(() => {
    if (!$itemsRef) return;
    removeActive();
    if (globalVariableCurrentFocus === null) return;
    if (globalVariableCurrentFocus >= $itemsRef.length) globalVariableCurrentFocus = 0;
    if (globalVariableCurrentFocus < 0) globalVariableCurrentFocus = $itemsRef.length - 1;
    const $node: Node | null = $itemsRef[globalVariableCurrentFocus];
    /* istanbul ignore next because it won't happen */
    if (!$node) {
      return;
    }
    $itemsRef[globalVariableCurrentFocus].current.className += ` ${reactInputsValidationCss[`${TYPE}__hover-active`]}`;
  }, []);
  const removeActive = useCallback(() => {
    for (let i = 0; i < $itemsRef.length; i += 1) {
      const $node: Node | null = $itemsRef[i];
      /* istanbul ignore next because it won't happen */
      if (!$node) {
        break;
      }
      if ($node && $node.current) {
        $node.current.className = $node.current.className.replace(reactInputsValidationCss[`${TYPE}__hover-active`], '');
      }
    }
  }, []);

  /* istanbul ignore next because of https://github.com/airbnb/enzyme/issues/441 && https://github.com/airbnb/enzyme/blob/master/docs/future.md */
  const onKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLElement>) => {
      setIsTyping(true);
      if (e.preventDefault) {
        e.preventDefault();
      }
      if (!show) {
        return;
      }
      globalVariableCurrentFocus = globalVariableCurrentFocus === null ? getIndex(optionList, String(value)) : globalVariableCurrentFocus;
      let direction = undefined;
      const { keyCode } = e;
      const keyCodeEsc = 27;
      const keyCodeDown = 40;
      const keyCodeUp = 38;
      const keyCodeEnter = 13;
      const selectKeyList = [keyCodeEsc, keyCodeDown, keyCodeUp, keyCodeEnter];
      if (selectKeyList.indexOf(keyCode) !== -1) {
        if (keyCode === keyCodeEsc) {
          setShow(false);
          resetCurrentFocus();
          return;
        }
        if (keyCode === keyCodeDown) {
          direction = 'down';
          globalVariableCurrentFocus += 1;
          if (globalVariableCurrentFocus > optionList.length - 1) {
            globalVariableCurrentFocus = optionList.length - 1;
          }
          addActive();
        } else if (keyCode === keyCodeUp) {
          direction = 'up';
          globalVariableCurrentFocus -= 1;
          if (globalVariableCurrentFocus < 0) {
            globalVariableCurrentFocus = 0;
          }
          addActive();
        } else if (keyCode === keyCodeEnter) {
          if (globalVariableCurrentFocus > -1) {
            if ($itemsRef[globalVariableCurrentFocus]) {
              $itemsRef[globalVariableCurrentFocus].current.click();
            } else {
              return;
            }
          }
        }
      } else {
        setTimeoutTyping();
        const newkeyCodeList = [...keycodeList, keyCode];
        const str = String.fromCharCode(...newkeyCodeList).toLowerCase();
        let index = -1;
        optionList.filter((i, k) => {
          const { name } = i;
          if (name.toLowerCase().startsWith(str)) {
            if (index === -1) {
              index = k;
            }
          }
        });
        if (index !== -1) {
          globalVariableCurrentFocus = index;
          addActive();
        }
        setKeycodeList(newkeyCodeList);
      }
      scroll(direction);
      return globalVariableCurrentFocus;
    },
    [show, value, keycodeList],
  );
  useEffect(
    () => {
      if (show && $elWrapper) {
        $elWrapper.current.addEventListener('keydown', onKeyDown);
      }
      return () => {
        $elWrapper.current.removeEventListener('keydown', onKeyDown);
      };
    },
    [show, value, keycodeList],
  );
  useEffect(
    () => {
      if (validate) {
        check();
      }
    },
    [validate],
  );
  useEffect(
    () => {
      if (!(!isValidValue(optionList, internalValue) || internalValue === '' || internalValue === 'null' || internalValue === 'undefined')) {
        setErr(false);
      } else {
        setSuccessMsg('');
      }
    },
    [internalValue],
  );
  useEffect(
    () => {
      setInternalValue(String(value));
    },
    [value],
  );
  useEffect(
    () => {
      if (typeof prevInternalValue !== 'undefined' && prevInternalValue !== internalValue) {
        check();
      }
    },
    [prevInternalValue, internalValue],
  );
  useEffect(
    () => {
      if (asyncObj) {
        if (asyncObj.message) {
          if (asyncObj.showOnError) {
            handleCheckEnd(asyncObj.error, asyncObj.message);
          }
          if (!asyncObj.error && asyncObj.showOnSuccess) {
            setSuccessMsg(asyncObj.message);
          }
        }
      }
    },
    [asyncMsgObj],
  );
  const wrapperClass = `${WRAPPER_CLASS_IDENTITIFIER} ${classNameWrapper} ${reactInputsValidationCss[`${TYPE}__wrapper`]} ${err && reactInputsValidationCss['error']} ${successMsg !== '' &&
    !err &&
    reactInputsValidationCss['success']} ${disabled && reactInputsValidationCss['disabled']}`;
  const containerClass = `${CONTAINER_CLASS_IDENTITIFIER} ${classNameContainer} ${reactInputsValidationCss[`${TYPE}__container`]} ${err && reactInputsValidationCss['error']} ${show &&
    reactInputsValidationCss['show']} ${successMsg !== '' && !err && reactInputsValidationCss['success']} ${disabled && reactInputsValidationCss['disabled']}`;
  const inputClass = `${reactInputsValidationCss[`${TYPE}__input`]} ${err && reactInputsValidationCss['error']} ${successMsg !== '' && !err && reactInputsValidationCss['success']} ${disabled &&
    reactInputsValidationCss['disabled']}`;
  const selectClass = `${classNameSelect} ${reactInputsValidationCss['ellipsis']} ${err && reactInputsValidationCss['error']} ${successMsg !== '' &&
    !err &&
    reactInputsValidationCss['success']} ${disabled && reactInputsValidationCss['disabled']}`;
  const selectOptionListContainerClass = `${classNameOptionListContainer} ${reactInputsValidationCss[`${TYPE}__options-container`]} ${err && reactInputsValidationCss['error']} ${show &&
    reactInputsValidationCss['show']} ${successMsg !== '' && !err && reactInputsValidationCss['success']} ${disabled && reactInputsValidationCss['disabled']}`;
  const selectOptionListItemClass = `${!isTyping && reactInputsValidationCss[`${TYPE}__options-item-show-cursor`]} ${classNameOptionListItem} ${
    reactInputsValidationCss[`${TYPE}__options-item`]
  } ${err && reactInputsValidationCss['error']} ${successMsg !== '' && !err && reactInputsValidationCss['success']} ${disabled && reactInputsValidationCss['disabled']}`;
  const dropdownIconClass = `${classNameDropdownIconOptionListItem} ${reactInputsValidationCss[`${TYPE}__dropdown-icon`]}`;
  const errMsgClass = `${MSG_CLASS_IDENTITIFIER} ${reactInputsValidationCss['msg']} ${err && reactInputsValidationCss['error']}`;
  const successMsgClass = `${MSG_CLASS_IDENTITIFIER} ${reactInputsValidationCss['msg']} ${!err && reactInputsValidationCss['success']}`;
  let msgHtml;
  const { showMsg } = option;
  if (showMsg && err && msg) {
    msgHtml = <div className={errMsgClass}>{msg}</div>;
  }
  if (showMsg && !err && successMsg !== '') {
    msgHtml = <div className={successMsgClass}>{successMsg}</div>;
  }
  let optionListHtml;
  const item = getItem(optionList, String(value));
  if (optionList.length) {
    if (selectOptionListItemHtml) {
      optionListHtml = selectOptionListItemHtml;
    } else {
      optionListHtml = optionList.map((i, k) => (
        <Option
          key={k}
          index={k}
          id={`react-inputs-validation__select_option-${i.id}`}
          refItem={$itemsRef[k]}
          className={String(i.id) === String(value) ? `${selectOptionListItemClass} ${reactInputsValidationCss['active']}` : `${selectOptionListItemClass}`}
          item={i}
          customStyleOptionListItem={customStyleOptionListItem}
          onClick={handleOnItemClick}
          onMouseOver={handleOnItemMouseOver}
          onMouseMove={handleOnItemMouseMove}
          onMouseOut={handleOnItemMouseOut}
        />
      ));
    }
  }
  const selectorHtml = selectHtml ? (
    selectHtml
  ) : (
    <div className={reactInputsValidationCss[`${TYPE}__dropdown`]}>
      <div className={`${reactInputsValidationCss[`${TYPE}__dropdown-name`]} ${reactInputsValidationCss['ellipsis']}`}>{item ? item.name : ''}</div>
      <div className={dropdownIconClass} />
    </div>
  );
  return (
    <div
      ref={$wrapper}
      className={wrapperClass}
      style={customStyleWrapper}
      onClick={e => {
        handleOnClick(e);
        !disabled ? setShow(!show) : ``;
      }}
      onFocus={handleOnFocus}
      onBlur={handleOnBlur}
    >
      <div className={containerClass} style={customStyleContainer}>
        <input name={name} type="hidden" value={value} className={inputClass} onChange={() => {}} />
        <div className={selectClass} style={customStyleSelect}>
          {selectorHtml}
        </div>
        <div ref={$itemsWrapper} className={selectOptionListContainerClass} style={customStyleOptionListContainer}>
          {optionListHtml}
        </div>
      </div>
      {msgHtml}
    </div>
  );
};
interface OptionProps {
  index?: number;
  id?: string;
  refItem?: React.RefObject<HTMLDivElement>;
  className?: string;
  item?: OptionListItem;
  customStyleOptionListItem?: object;
  onClick?: (res: string, e: React.MouseEvent<HTMLElement>) => void;
  onMouseOver?: (res: number) => void;
  onMouseMove?: () => void;
  onMouseOut?: () => void;
}
export const Option: React.FC<OptionProps> = memo(
  ({
    index = -1,
    refItem = null,
    id = '',
    className = '',
    item = { id: '', name: '' },
    customStyleOptionListItem = {},
    onClick = () => {},
    onMouseOver = () => {},
    onMouseMove = () => {},
    onMouseOut = () => {},
  }) => {
    const handleOnClick = useCallback((e: React.MouseEvent<HTMLElement>) => {
      onClick(item.id, e);
    }, []);
    const handleOnMouseOver = useCallback(() => {
      onMouseOver(index);
    }, []);
    const handleOnMouseMove = useCallback(() => {
      onMouseMove();
    }, []);
    const handleOnMouseOut = useCallback(() => {
      onMouseOut();
    }, []);
    return (
      <div
        id={id}
        ref={refItem}
        onMouseOver={handleOnMouseOver}
        onMouseMove={handleOnMouseMove}
        onMouseOut={handleOnMouseOut}
        className={className}
        style={customStyleOptionListItem}
        onClick={handleOnClick}
      >
        {item.name}
      </div>
    );
  },
);
export default memo(component);

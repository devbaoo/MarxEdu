import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Button,
  Card,
  Divider,
  Empty,
  Input,
  InputNumber,
  Pagination,
  Space,
  Spin,
  Typography,
} from "antd";
import {
  ReloadOutlined,
  SearchOutlined,
  LeftOutlined,
  RightOutlined,
} from "@ant-design/icons";
import {
  useAppDispatch,
  useAppSelector,
} from "@/services/store/store";
import {
  clearRandomFlashcards,
  fetchFlashcardTags,
  fetchFlashcards,
  fetchRandomFlashcards,
  setFocusedFlashcards,
  goToNextFlashcard,
  goToPrevFlashcard,
} from "@/services/features/flashcard/flashcardSlice";
import FlashcardCard from "@/components/Flashcard/FlashcardCard";

const { Title, Text } = Typography;
const { Search } = Input;

const DEFAULT_PAGE_SIZE = 10;
const DEFAULT_RANDOM_LIMIT = 5;

const FlashcardsPage = () => {
  const dispatch = useAppDispatch();
  const {
    flashcards,
    loading,
    error,
    pagination,
    tags,
    tagsLoading,
    randomLoading,
    randomError,
    focusedList,
    focusedIndex,
  } = useAppSelector((state) => state.flashcard);

  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [searchValue, setSearchValue] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [randomLimit, setRandomLimit] = useState(DEFAULT_RANDOM_LIMIT);

  useEffect(() => {
    dispatch(fetchFlashcardTags());
  }, [dispatch]);

  useEffect(() => {
    dispatch(
      fetchFlashcards({
        tag: selectedTag || undefined,
        search: appliedSearch || undefined,
        page: currentPage,
        limit: pageSize,
      })
    );
  }, [dispatch, selectedTag, appliedSearch, currentPage, pageSize]);

  const handleSearch = (value: string) => {
    setAppliedSearch(value.trim());
    setCurrentPage(1);
  };

  const handleTagSelect = (tag: string | null) => {
    const nextTag = selectedTag === tag ? null : tag;
    setSelectedTag(nextTag);
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setSelectedTag(null);
    setSearchValue("");
    setAppliedSearch("");
    setCurrentPage(1);
  };

  const handleChangePage = (page: number, newPageSize?: number) => {
    setCurrentPage(page);
    if (newPageSize && newPageSize !== pageSize) {
      setPageSize(newPageSize);
    }
  };

  const handleRandomFetch = async () => {
    if (!randomLimit || randomLimit <= 0) {
      return;
    }

    try {
      const result = await dispatch(
        fetchRandomFlashcards({
          tag: selectedTag || undefined,
          limit: randomLimit,
        })
      ).unwrap();

      if (Array.isArray(result.data) && result.data.length > 0) {
        dispatch(setFocusedFlashcards(result.data));
      }
    } catch (err) {
      console.error("Failed to fetch random flashcards", err);
    }
  };

  useEffect(() => {
    return () => {
      dispatch(clearRandomFlashcards());
    };
  }, [dispatch]);

  useEffect(() => {
    dispatch(setFocusedFlashcards(flashcards));
  }, [dispatch, flashcards]);

  const paginationMeta = useMemo(() => {
    if (!pagination) {
      return {
        total: 0,
        totalPages: 0,
      };
    }

    return {
      total: pagination.total || flashcards.length,
      totalPages: pagination.totalPages || 0,
    };
  }, [pagination, flashcards.length]);

  const totalAvailableFlashcards = useMemo(() => {
    if (pagination && typeof pagination.total === "number") {
      return pagination.total;
    }
    return flashcards.length;
  }, [pagination, flashcards.length]);

  const renderTagButton = (
    tagValue: string | null,
    label: string,
    count?: number,
    key?: string
  ) => {
    const isActive = (tagValue ?? null) === selectedTag;
    return (
      <button
        key={key || label}
        type="button"
        onClick={() => handleTagSelect(tagValue)}
        className={`w-full rounded-xl border px-3 py-2 text-left text-sm font-medium transition-colors duration-200 ${
          isActive
            ? "border-emerald-400 bg-emerald-50 text-emerald-700 shadow-sm"
            : "border-slate-200 bg-slate-50/60 text-slate-600 hover:border-emerald-300 hover:bg-emerald-50/50"
        }`}
      >
        <span className="flex items-center justify-between gap-2">
          <span className="truncate">{label}</span>
          {typeof count === "number" && (
            <span className="text-xs font-semibold text-slate-400">{count}</span>
          )}
        </span>
      </button>
    );
  };

  const activeDeckLength = focusedList?.length ?? 0;
  const currentFlashcard =
    focusedList && activeDeckLength > 0
      ? focusedList[Math.min(focusedIndex, activeDeckLength - 1)]
      : null;

  const hasFlashcards = currentFlashcard !== null;
  const isUsingCurrentList = focusedList === flashcards;

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Title level={2} className="m-0">
            🧠 Bộ Flashcards Triết học Mác-Lênin
          </Title>
          <Text type="secondary">
            Ôn tập nhanh các khái niệm trọng tâm với các thẻ ghi nhớ được phân loại theo chủ đề.
          </Text>
        </div>
        <Space align="center" className="mt-2 sm:mt-0">
          <InputNumber
            min={1}
            max={50}
            value={randomLimit}
            onChange={(value) => setRandomLimit(value ?? DEFAULT_RANDOM_LIMIT)}
            formatter={(value) => `${value}`}
            parser={(value) => Number(value || DEFAULT_RANDOM_LIMIT)}
            size="middle"
          />
          <Button
            type="primary"
            icon={<ReloadOutlined />}
            loading={randomLoading}
            onClick={handleRandomFetch}
          >
            Luyện ngẫu nhiên
          </Button>
          <Text type="secondary" className="hidden sm:block">
            {hasFlashcards
              ? `Flashcard ${focusedIndex + 1} / ${activeDeckLength}`
              : "Không có flashcard"}
          </Text>
        </Space>
      </div>

      <div className="grid gap-6 lg:grid-cols-[320px,1fr]">
        <Card
          className="shadow-sm lg:sticky lg:top-24"
          title={<span className="text-base font-semibold text-slate-700">Bộ lọc</span>}
          extra={
            <Button
              type="text"
              size="small"
              disabled={!selectedTag && !appliedSearch && !searchValue}
              onClick={handleResetFilters}
            >
              Đặt lại
            </Button>
          }
        >
          <Space direction="vertical" size="large" className="w-full">
            <div className="space-y-2">
              <Text className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Tìm kiếm
              </Text>
              <Search
                placeholder="Nhập từ khoá cần tìm"
                enterButton={<SearchOutlined />}
                value={searchValue}
                allowClear
                onChange={(event) => setSearchValue(event.target.value)}
                onSearch={handleSearch}
                size="large"
              />
            </div>

            <Divider className="my-0" />

            <div className="space-y-3">
              <Text className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Chủ đề
              </Text>
              <div className="flex flex-col gap-2 max-h-[360px] overflow-y-auto pr-1">
                {renderTagButton(null, "Tất cả", totalAvailableFlashcards, "all")}
                {tagsLoading ? (
                  <div className="flex justify-center py-4">
                    <Spin size="small" />
                  </div>
                ) : tags.length > 0 ? (
                  tags.map((tag) =>
                    renderTagButton(tag.tag, tag.tag, tag.count, tag.tag)
                  )
                ) : (
                  <Text type="secondary" className="text-xs">
                    Chưa có tag nào
                  </Text>
                )}
              </div>
            </div>
          </Space>
        </Card>

        <div className="space-y-6">
          <Alert
            type="info"
            showIcon
            className="shadow-sm rounded-2xl border border-emerald-100"
            message="Cách sử dụng flashcard"
            description="Bấm hoặc nhấn phím Enter/Space để lật thẻ. Ôn lại cho tới khi bạn nhớ mặt sau mà không cần lật."
          />

          {randomError && (
            <Alert type="error" showIcon message={randomError} />
          )}

          <Card className="shadow-sm" title="📚 Ôn luyện Flashcards">
            {error && (
              <Alert type="error" showIcon className="mb-4" message={error} />
            )}

            {loading ? (
              <div className="flex justify-center py-12">
                <Spin tip="Đang tải flashcards..." />
              </div>
            ) : !hasFlashcards ? (
              <Empty description="Không tìm thấy flashcard phù hợp" />
            ) : (
              <div className="flex flex-col items-center gap-6">
                <div className="flex w-full max-w-3xl items-center gap-4 mx-auto">
                  <Button
                    shape="circle"
                    size="large"
                    icon={<LeftOutlined />}
                    onClick={() => dispatch(goToPrevFlashcard())}
                    disabled={focusedIndex <= 0}
                    className="flex-shrink-0 shadow-md"
                  />
                  <div className="flex-1 min-w-[280px] max-w-xl">
                    {currentFlashcard && (
                      <FlashcardCard flashcard={currentFlashcard} />
                    )}
                  </div>
                  <Button
                    shape="circle"
                    size="large"
                    icon={<RightOutlined />}
                    onClick={() => dispatch(goToNextFlashcard())}
                    disabled={focusedIndex >= activeDeckLength - 1}
                    className="flex-shrink-0 shadow-md"
                  />
                </div>

                <div className="flex flex-wrap items-center justify-center gap-3 text-sm text-slate-600">
                  <span>
                    Flashcard {focusedIndex + 1} / {activeDeckLength}
                  </span>
                  <Divider type="vertical" />
                  <span>
                    Tag: {currentFlashcard?.tags?.join(", ") || "Chưa có"}
                  </span>
                  <Divider type="vertical" />
                  <Button
                    size="small"
                    disabled={isUsingCurrentList}
                    onClick={() => dispatch(setFocusedFlashcards(flashcards))}
                  >
                    Xem theo danh sách hiện tại
                  </Button>
                </div>
              </div>
            )}

            <Divider />
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <Pagination
                current={currentPage}
                pageSize={pageSize}
                total={paginationMeta.total}
                showSizeChanger
                pageSizeOptions={["10", "20", "50", "100"]}
                onChange={handleChangePage}
                onShowSizeChange={handleChangePage}
                showTotal={(total) => `${total} flashcard`}
              />
              <Text type="secondary">
                Tổng số: {paginationMeta.total || 0} flashcard
              </Text>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default FlashcardsPage;

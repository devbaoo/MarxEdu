import { Fragment, useCallback, useEffect, useRef, useState } from "react";
import {
    ActiveBookSvg,
    LockedBookSvg,
    CheckmarkSvg,
    LockedDumbbellSvg,
    FastForwardSvg,
    GoldenBookSvg,
    GoldenDumbbellSvg,
    GoldenTreasureSvg,
    GoldenTrophySvg,
    LessonCompletionSvg0,
    LessonCompletionSvg1,
    LessonCompletionSvg2,
    LessonCompletionSvg3,
    LockSvg,
    StarSvg,
    LockedTreasureSvg,
    LockedTrophySvg,
    ActiveTreasureSvg,
    ActiveTrophySvg,
    ActiveDumbbellSvg,
    PracticeExerciseSvg,
} from "@/components/ui/Svgs";
import { Link, useNavigate } from "react-router-dom";
import { type Tile, type TileType, type Unit } from "@/lib/utils";
import { useAppDispatch, useAppSelector } from "@/services/store/store";
import { fetchLessons, retryLesson } from "@/services/features/lesson/lessonSlice";
import { fetchUserProfile } from "@/services/features/user/userSlice";
import { Modal } from 'antd';

// Trạng thái của mỗi tile
// Không dùng useBoundStore, chỉ dùng state cục bộ cho lessonsCompleted

type TileStatus = "LOCKED" | "ACTIVE" | "COMPLETE";
// (Bạn có thể thay đổi logic này nếu muốn lưu lessonsCompleted vào localStorage hoặc backend)| "ACTIVE" | "COMPLETE";

const TileIcon = ({
    tileType,
    status,
}: {
    tileType: TileType;
    status: TileStatus;
}): JSX.Element => {
    switch (tileType) {
        case "star":
            return status === "COMPLETE" ? (
                <CheckmarkSvg />
            ) : status === "ACTIVE" ? (
                <StarSvg />
            ) : (
                <LockSvg />
            );
        case "book":
            return status === "COMPLETE" ? (
                <GoldenBookSvg />
            ) : status === "ACTIVE" ? (
                <ActiveBookSvg />
            ) : (
                <LockedBookSvg />
            );
        case "dumbbell":
            return status === "COMPLETE" ? (
                <GoldenDumbbellSvg />
            ) : status === "ACTIVE" ? (
                <ActiveDumbbellSvg />
            ) : (
                <LockedDumbbellSvg />
            );
        case "fast-forward":
            return status === "COMPLETE" ? (
                <CheckmarkSvg />
            ) : status === "ACTIVE" ? (
                <StarSvg />
            ) : (
                <FastForwardSvg />
            );
        case "treasure":
            return status === "COMPLETE" ? (
                <GoldenTreasureSvg />
            ) : status === "ACTIVE" ? (
                <ActiveTreasureSvg />
            ) : (
                <LockedTreasureSvg />
            );
        case "trophy":
            return status === "COMPLETE" ? (
                <GoldenTrophySvg />
            ) : status === "ACTIVE" ? (
                <ActiveTrophySvg />
            ) : (
                <LockedTrophySvg />
            );
    }
};

const tileLeftClassNames = [
    "left-0",
    "left-[-45px]",
    "left-[-70px]",
    "left-[-45px]",
    "left-0",
    "left-[45px]",
    "left-[70px]",
    "left-[45px]",
] as const;

type TileLeftClassName = (typeof tileLeftClassNames)[number];

const getTileLeftClassName = ({
    index,
    unitNumber,
    tilesLength,
}: {
    index: number;
    unitNumber: number;
    tilesLength: number;
}): TileLeftClassName => {
    if (index >= tilesLength - 1) {
        return "left-0";
    }

    const classNames =
        unitNumber % 2 === 1
            ? tileLeftClassNames
            : [...tileLeftClassNames.slice(4), ...tileLeftClassNames.slice(0, 4)];

    return classNames[index % classNames.length] ?? "left-0";
};

const tileTooltipLeftOffsets = [140, 95, 70, 95, 140, 185, 210, 185] as const;

type TileTooltipLeftOffset = (typeof tileTooltipLeftOffsets)[number];

const getTileTooltipLeftOffset = ({
    index,
    unitNumber,
    tilesLength,
}: {
    index: number;
    unitNumber: number;
    tilesLength: number;
}): TileTooltipLeftOffset => {
    if (index >= tilesLength - 1) {
        return tileTooltipLeftOffsets[0];
    }

    const offsets =
        unitNumber % 2 === 1
            ? tileTooltipLeftOffsets
            : [
                ...tileTooltipLeftOffsets.slice(4),
                ...tileTooltipLeftOffsets.slice(0, 4),
            ];

    return offsets[index % offsets.length] ?? tileTooltipLeftOffsets[0];
};

const getTileColors = ({
    tileType,
    status,
    isCompleted,
    defaultColors,
}: {
    tileType: TileType;
    status: TileStatus;
    isCompleted: boolean;
    defaultColors: `border-${string} bg-${string}`;
}): `border-${string} bg-${string}` => {
    switch (status) {
        case "LOCKED":
            if (tileType === "fast-forward") return defaultColors;
            return "border-[#b7b7b7] bg-[#e5e5e5]";
        case "COMPLETE":
            return "border-[#FFD175] bg-[#FFB020]";
        case "ACTIVE":
            if (isCompleted) {
                return "border-[#FFD175] bg-[#FFB020]";
            }
            return defaultColors;
    }
};

const TileTooltip = ({
    selectedTile,
    index,
    unitNumber,
    tilesLength,
    description,
    status,
    closeTooltip,
    backgroundColor,
    textColor,
    lessonId,
    isCompleted,
}: {
    selectedTile: number | null;
    index: number;
    unitNumber: number;
    tilesLength: number;
    description: string;
    status: TileStatus;
    closeTooltip: () => void;
    backgroundColor: string;
    textColor: string;
    lessonId?: string;
    isCompleted: boolean;
}) => {
    const tileTooltipRef = useRef<HTMLDivElement | null>(null);
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const { profile: userProfile } = useAppSelector((state) => state.user);

    useEffect(() => {
        const containsTileTooltip = (event: MouseEvent) => {
            if (selectedTile !== index) return;
            const clickIsInsideTooltip = tileTooltipRef.current?.contains(
                event.target as Node,
            );
            if (clickIsInsideTooltip) return;
            closeTooltip();
        };

        window.addEventListener("click", containsTileTooltip, true);
        return () => window.removeEventListener("click", containsTileTooltip, true);
    }, [selectedTile, tileTooltipRef, closeTooltip, index]);

    const handleStart = async (e: React.MouseEvent) => {
        e.preventDefault();
        if (!lessonId) return;

        if (isCompleted) {
            // Nếu bài học đã hoàn thành, kiểm tra lives
            if (userProfile?.lives === 0) {
                Modal.info({
                    title: <span className="font-baloo text-xl">Out of Lives</span>,
                    content: <span className="font-baloo text-lg">Hiện tại số tim của bạn là 0, bạn không thể làm lại bài này. Hãy chờ hoặc mua thêm tim để tiếp tục!</span>,
                    centered: true,
                    okText: <span className="font-baloo">OK</span>,
                });
                return;
            }

            Modal.confirm({
                title: <span className="font-baloo text-xl">Try this lesson again?</span>,
                content: <span className="font-baloo text-lg">Your previous result will be reset.</span>,
                okText: <span className="font-baloo">Yes, try again</span>,
                cancelText: <span className="font-baloo">Cancel</span>,
                centered: true,
                onOk: async () => {
                    try {
                        await dispatch(retryLesson({
                            lessonId: lessonId,
                        })).unwrap();
                        await dispatch(fetchUserProfile());
                        navigate(`/lesson/${lessonId}`);
                    } catch (error) {
                        console.error("Failed to retry lesson:", error);
                        Modal.error({
                            title: <span className="font-baloo text-xl">Error</span>,
                            content: <span className="font-baloo text-lg">Không thể làm lại bài học. Vui lòng thử lại sau!</span>,
                            centered: true,
                            okText: <span className="font-baloo">OK</span>,
                        });
                    }
                },
            });
        } else {
            // Nếu bài học chưa hoàn thành, kiểm tra lives
            if (userProfile?.lives === 0) {
                Modal.info({
                    title: <span className="font-baloo text-xl">Out of Lives</span>,
                    content: <span className="font-baloo text-lg">Hiện tại số tim của bạn là 0, bạn không thể bắt đầu bài học này. Hãy chờ hoặc mua thêm tim để tiếp tục!</span>,
                    centered: true,
                    okText: <span className="font-baloo">OK</span>,
                });
                return;
            }
            navigate(`/lesson/${lessonId}`);
        }
    };

    const activeBackgroundColor = backgroundColor ?? "bg-green-500";
    const activeTextColor = textColor ?? "text-green-500";
    const completedBackgroundColor = "bg-[#FFB020]";
    const completedTextColor = "text-[#975D07]";
    const completedBorderColor = "border-[#FFD175]";

    return (
        <div
            className={[
                "relative h-0 w-full",
                index === selectedTile ? "" : "invisible",
            ].join(" ")}
            ref={tileTooltipRef}
        >
            <div
                className={[
                    "absolute z-30 flex w-[300px] flex-col gap-4 rounded-xl p-4 font-bold transition-all duration-300",
                    status === "ACTIVE"
                        ? activeBackgroundColor
                        : status === "LOCKED"
                            ? "border-2 border-gray-200 bg-gray-100"
                            : completedBackgroundColor,
                    index === selectedTile ? "top-4 scale-100" : "-top-14 scale-0",
                ].join(" ")}
                style={{ left: "calc(50% - 150px)" }}
            >
                <div
                    className={[
                        "absolute left-[140px] top-[-8px] h-4 w-4 rotate-45",
                        status === "ACTIVE"
                            ? activeBackgroundColor
                            : status === "LOCKED"
                                ? "border-l-2 border-t-2 border-gray-200 bg-gray-100"
                                : completedBackgroundColor,
                    ].join(" ")}
                    style={{
                        left: getTileTooltipLeftOffset({ index, unitNumber, tilesLength }),
                    }}
                ></div>
                <div
                    className={[
                        "text-lg",
                        status === "ACTIVE"
                            ? "text-white"
                            : status === "LOCKED"
                                ? "text-gray-400"
                                : completedTextColor,
                    ].join(" ")}
                >
                    {description}
                </div>
                <div className="flex gap-2">
                    {status === "ACTIVE" ? (
                        <button
                            onClick={handleStart}
                            className={[
                                "flex flex-1 items-center justify-center rounded-xl border-b-4 border-gray-200 bg-white p-3 uppercase",
                                isCompleted ? completedTextColor : activeTextColor,
                            ].join(" ")}
                        >
                            {isCompleted ? "Practice +5 XP" : "Start"}
                        </button>
                    ) : status === "LOCKED" ? (
                        <button
                            className="w-full rounded-xl bg-gray-200 p-3 uppercase text-gray-400"
                            disabled
                        >
                            Locked
                        </button>
                    ) : (
                        <button
                            onClick={handleStart}
                            className={`flex w-full items-center justify-center rounded-xl border-b-4 ${completedBorderColor} bg-white p-3 uppercase ${completedTextColor}`}
                        >
                            Practice +5 XP
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

const UnitSection = ({ unit, prevUnitCompleted }: { unit: Unit; prevUnitCompleted: boolean }): JSX.Element => {
    const [selectedTile, setSelectedTile] = useState<null | number>(null);
    const closeTooltip = useCallback(() => setSelectedTile(null), []);
    const { lessons } = useAppSelector((state) => state.lesson);

    return (
        <>
            <UnitHeader
                unitNumber={unit.unitNumber}
                description={unit.description}
                backgroundColor={unit.backgroundColor}
            />
            <div className="relative mb-8 mt-2 flex max-w-2xl flex-col items-center gap-4">
                {unit.tiles.map((tile, i): JSX.Element => {
                    const currentLesson = lessons.find(l => l.lessonId === tile.lessonId);
                    const isCompleted = currentLesson?.completed || false;
                    const lessonStatus = currentLesson?.status || "LOCKED";

                    let status: TileStatus = "LOCKED";
                    
                    // Kiểm tra nếu là bài học đầu tiên của unit đầu tiên
                    const isFirstLesson = unit.unitNumber === 1 && i === 0;
                    
                    if (isFirstLesson) {
                        // Bài học đầu tiên luôn ACTIVE
                        status = "ACTIVE";
                    } else if (!prevUnitCompleted) {
                        status = "LOCKED";
                    } else if (isCompleted) {
                        status = "COMPLETE";
                    } else if (lessonStatus !== "LOCKED") {
                        status = "ACTIVE";
                    }

                    return (
                        <Fragment key={i}>
                            {(() => {
                                switch (tile.type) {
                                    case "star":
                                    case "book":
                                    case "dumbbell":
                                    case "trophy":
                                    case "fast-forward":
                                        if (tile.type === "trophy" && status === "COMPLETE") {
                                            return (
                                                <div className="relative">
                                                    <TileIcon tileType={tile.type} status={status} />
                                                    <div className="absolute left-0 right-0 top-6 flex justify-center text-lg font-bold text-yellow-700">
                                                        {unit.unitNumber}
                                                    </div>
                                                </div>
                                            );
                                        }
                                        return (
                                            <div
                                                className={[
                                                    "relative -mb-4 h-[93px] w-[98px]",
                                                    getTileLeftClassName({
                                                        index: i,
                                                        unitNumber: unit.unitNumber,
                                                        tilesLength: unit.tiles.length,
                                                    }),
                                                ].join(" ")}
                                            >
                                                {tile.type === "fast-forward" && status === "ACTIVE" ? (
                                                    <HoverLabel
                                                        text="Jump here?"
                                                        textColor={unit.textColor}
                                                    />
                                                ) : selectedTile !== i && status === "ACTIVE" && !isCompleted ? (
                                                    <HoverLabel text="Start" textColor={unit.textColor} />
                                                ) : null}
                                                <LessonCompletionSvg
                                                    lessonsCompleted={i}
                                                    status={status}
                                                    isCompleted={isCompleted}
                                                />
                                                <button
                                                    className={[
                                                        "absolute m-3 rounded-full border-b-8 p-4",
                                                        getTileColors({
                                                            tileType: tile.type,
                                                            status,
                                                            isCompleted,
                                                            defaultColors: `${unit.borderColor} ${unit.backgroundColor}`,
                                                        }),
                                                    ].join(" ")}
                                                    onClick={() => {
                                                        if (
                                                            tile.type === "fast-forward" &&
                                                            status === "ACTIVE"
                                                        ) {
                                                            return;
                                                        }
                                                        setSelectedTile(i);
                                                    }}
                                                >
                                                    <TileIcon tileType={tile.type} status={status} />
                                                    <span className="sr-only">Show lesson</span>
                                                </button>
                                            </div>
                                        );
                                    case "treasure":
                                        return (
                                            <div
                                                className={[
                                                    "relative -mb-4",
                                                    getTileLeftClassName({
                                                        index: i,
                                                        unitNumber: unit.unitNumber,
                                                        tilesLength: unit.tiles.length,
                                                    }),
                                                ].join(" ")}
                                                onClick={() => {
                                                    if (status === "ACTIVE") {
                                                        setSelectedTile(i);
                                                    }
                                                }}
                                                role="button"
                                                tabIndex={status === "ACTIVE" ? 0 : undefined}
                                                aria-hidden={status !== "ACTIVE"}
                                                aria-label={status === "ACTIVE" ? "Collect reward" : ""}
                                            >
                                                {status === "ACTIVE" && (
                                                    <HoverLabel text="Open" textColor="text-yellow-400" />
                                                )}
                                                <TileIcon tileType={tile.type} status={status} />
                                            </div>
                                        );
                                }
                            })()}
                            <TileTooltip
                                selectedTile={selectedTile}
                                index={i}
                                unitNumber={unit.unitNumber}
                                tilesLength={unit.tiles.length}
                                description={(() => {
                                    switch (tile.type) {
                                        case "book":
                                        case "dumbbell":
                                        case "star":
                                            return tile.description;
                                        case "fast-forward":
                                            return status === "ACTIVE"
                                                ? "Jump here?"
                                                : tile.description;
                                        case "trophy":
                                            return `Unit ${unit.unitNumber} review`;
                                        case "treasure":
                                            return "";
                                    }
                                })()}
                                status={status}
                                closeTooltip={closeTooltip}
                                backgroundColor={unit.backgroundColor}
                                textColor={unit.textColor}
                                lessonId={tile.lessonId}
                                isCompleted={isCompleted}
                            />
                        </Fragment>
                    );
                })}
            </div>
        </>
    );
};

const LessonCompletionSvg = ({
    lessonsCompleted,
    status,
    isCompleted,
    style = {},
}: {
    lessonsCompleted: number;
    status: TileStatus;
    isCompleted: boolean;
    style?: React.HTMLAttributes<SVGElement>["style"];
}) => {
    if (status !== "ACTIVE" || isCompleted) {
        return null;
    }
    switch (lessonsCompleted % 4) {
        case 0:
            return <LessonCompletionSvg0 style={style} />;
        case 1:
            return <LessonCompletionSvg1 style={style} />;
        case 2:
            return <LessonCompletionSvg2 style={style} />;
        case 3:
            return <LessonCompletionSvg3 style={style} />;
        default:
            return null;
    }
};

const HoverLabel = ({
    text,
    textColor,
}: {
    text: string;
    textColor: `text-${string}`;
}) => {
    const hoverElement = useRef<HTMLDivElement | null>(null);
    const [width, setWidth] = useState(72);

    useEffect(() => {
        setWidth(hoverElement.current?.clientWidth ?? width);
    }, [hoverElement.current?.clientWidth, width]);

    return (
        <div
            className={`absolute z-10 w-max animate-bounce rounded-lg border-2 border-gray-200 bg-white px-3 py-2 font-bold uppercase ${textColor}`}
            style={{
                top: "-25%",
                left: `calc(50% - ${width / 2}px)`,
            }}
            ref={hoverElement}
        >
            {text}
            <div
                className="absolute h-3 w-3 rotate-45 border-b-2 border-r-2 border-gray-200 bg-white"
                style={{ left: "calc(50% - 8px)", bottom: "-8px" }}
            ></div>
        </div>
    );

};

const UnitHeader = ({
    unitNumber,
    description,
    backgroundColor,
}: {
    unitNumber: number;
    description: string;
    backgroundColor: `bg-${string}`;
}) => {
    return (
        <article
            className={[
                "max-w-2xl w-[calc(100%+20px)] sm:w-[calc(100%+40px)] ml-[-10px] sm:ml-[-20px] text-white sm:rounded-xl",
                backgroundColor
            ].join(" ")}
        >
            <header className="flex items-center justify-between gap-2 sm:gap-4 p-3 sm:p-4">
                <div className="flex flex-col gap-1">
                    <h2 className="text-xl sm:text-2xl font-bold">Topic {unitNumber}</h2>
                    <p className="text-base sm:text-lg">{description}</p>
                </div>
            </header>
        </article>
    );
};

const LearnPage = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const { profile } = useAppSelector((state) => state.user);
    const { lessons, error: lessonsError, pagination, loading } = useAppSelector((state) => state.lesson);
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        if (!profile?.level || !profile?.preferredSkills || profile.preferredSkills.length === 0) {
            navigate("/choose-topic");
            return;
        }

        dispatch(fetchLessons({ page: currentPage, limit: 5 }));
    }, [dispatch, profile, navigate, currentPage]);

    // Map learning path items to units
    const units: Unit[] = Array.from(new Set(lessons.map(lesson => lesson.topic)))
        .map((topic, idx) => {
            const topicLessons = lessons.filter(lesson => lesson.topic === topic);
            const tiles: Tile[] = topicLessons.map(lesson => ({
                type: "book",
                description: lesson.title,
                lessonId: lesson.lessonId,
            }));
            return {
                unitNumber: idx + 1,
                description: `${topic} - ${topicLessons[0].level}`,
                backgroundColor: "bg-blue-500",
                textColor: "text-blue-500",
                borderColor: "border-blue-500",
                tiles,
            };
        });

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (lessonsError) {
        return <div className="text-red-500 text-center p-4 sm:p-10">Lỗi: {lessonsError}</div>;
    }

    if (!lessons || lessons.length === 0) {
        return <div className="text-center p-4 sm:p-10">No lessons available in your learning path</div>;
    }

    return (
        <div className="flex justify-center items-start pt-8 sm:pt-14 px-2 sm:px-6 min-h-screen bg-white">
            <div className="flex w-full max-w-2xl flex-col items-center mx-auto gap-4 sm:gap-8">
                {units.map((unit, unitIdx) => {
                    // Kiểm tra topic trước đã hoàn thành hết chưa
                    let prevUnitCompleted = true;
                    if (unitIdx > 0) {
                        const prevUnit = units[unitIdx - 1];
                        prevUnitCompleted = prevUnit.tiles.every(
                            tile => tile.lessonId && lessons?.find(l => l.lessonId === tile.lessonId)?.completed
                        );
                    }
                    return (
                        <UnitSection
                            unit={unit}
                            key={unit.unitNumber}
                            prevUnitCompleted={prevUnitCompleted}
                        />
                    );
                })}

                {/* Pagination */}
                {pagination && pagination.totalPages > 1 && (
                    <div className="flex justify-center gap-4 mt-8">
                        <button
                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                            disabled={currentPage === 1}
                            className={`rounded-2xl border-b-2 px-6 py-3 font-bold font-baloo w-32 transition-all ${currentPage === 1
                                ? "border-b-gray-300 bg-gray-200 text-gray-400 cursor-not-allowed"
                                : "border-b-blue-300 bg-blue-500 text-white ring-2 ring-blue-300 hover:bg-blue-400 active:translate-y-[0.125rem] active:border-b-blue-200"
                                }`}
                        >
                            Previous
                        </button>
                        <span className="px-4 py-3 font-baloo text-gray-700">
                            Page {currentPage} of {pagination.totalPages}
                        </span>
                        <button
                            onClick={() => setCurrentPage(prev => Math.min(pagination.totalPages, prev + 1))}
                            disabled={currentPage === pagination.totalPages}
                            className={`rounded-2xl border-b-2 px-6 py-3 font-bold font-baloo w-32 transition-all ${currentPage === pagination.totalPages
                                ? "border-b-gray-300 bg-gray-200 text-gray-400 cursor-not-allowed"
                                : "border-b-blue-300 bg-blue-500 text-white ring-2 ring-blue-300 hover:bg-blue-400 active:translate-y-[0.125rem] active:border-b-blue-200"
                                }`}
                        >
                            Next
                        </button>
                    </div>
                )}

                <div className="sticky bottom-20 sm:bottom-28 left-0 right-0 flex items-end justify-between w-full">
                    <Link
                        to="/lesson?practice"
                        className="absolute left-2 sm:left-4 flex h-12 w-12 sm:h-16 sm:w-16 items-center justify-center rounded-full border-2 border-b-4 border-gray-200 bg-white transition hover:bg-gray-50 hover:brightness-90 md:left-0"
                    >
                        <span className="sr-only">Practice exercise</span>
                        <PracticeExerciseSvg className="h-6 w-6 sm:h-8 sm:w-8" />
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default LearnPage;
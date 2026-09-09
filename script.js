/* =========================================================
   LB COMPUTER INSTITUTE
   MAIN JAVASCRIPT
   ========================================================= */

document.addEventListener("DOMContentLoaded", function () {

    /* =====================================================
       01. MOBILE MENU
       ===================================================== */

    const menuToggle = document.querySelector(".menu-toggle");
    const mainNav = document.querySelector("#mainNav");

    if (menuToggle && mainNav) {

        menuToggle.addEventListener("click", function () {

            mainNav.classList.toggle("open");

            const isOpen = mainNav.classList.contains("open");

            menuToggle.setAttribute(
                "aria-expanded",
                isOpen ? "true" : "false"
            );

            menuToggle.innerHTML = isOpen ? "✕" : "☰";
        });


        /* Close menu after clicking a link */

        const navLinks = mainNav.querySelectorAll("a");

        navLinks.forEach(function (link) {

            link.addEventListener("click", function () {

                mainNav.classList.remove("open");

                menuToggle.setAttribute(
                    "aria-expanded",
                    "false"
                );

                menuToggle.innerHTML = "☰";
            });

        });
    }


    /* =====================================================
       02. ACTIVE NAVIGATION
       ===================================================== */

    const currentPage =
        window.location.pathname
            .split("/")
            .pop()
            .toLowerCase();

    const navItems =
        document.querySelectorAll("#mainNav > a");

    navItems.forEach(function (link) {

        const linkPage =
            link.getAttribute("href");

        if (!linkPage) return;

        const cleanLink =
            linkPage.split("/").pop().toLowerCase();

        if (
            cleanLink === currentPage ||
            (
                currentPage === "" &&
                cleanLink === "index.html"
            )
        ) {
            link.classList.add("active");
        }

    });


    /* =====================================================
       03. COUNTER ANIMATION
       ===================================================== */

    const counters =
        document.querySelectorAll("[data-counter]");

    function animateCounter(counter) {

        const target =
            parseInt(
                counter.getAttribute("data-counter"),
                10
            );

        if (isNaN(target)) return;

        const duration = 1800;

        const startTime = performance.now();

        function updateCounter(currentTime) {

            const elapsed =
                currentTime - startTime;

            const progress =
                Math.min(
                    elapsed / duration,
                    1
                );

            /*
             * Smooth animation
             */

            const eased =
                1 - Math.pow(1 - progress, 3);

            const currentValue =
                Math.floor(
                    eased * target
                );

            counter.textContent =
                currentValue.toLocaleString("en-IN");

            if (progress < 1) {

                requestAnimationFrame(
                    updateCounter
                );

            } else {

                counter.textContent =
                    target.toLocaleString("en-IN");

            }
        }

        requestAnimationFrame(
            updateCounter
        );
    }


    /*
     * Start counters when they become visible
     */

    if (counters.length > 0) {

        if ("IntersectionObserver" in window) {

            const counterObserver =
                new IntersectionObserver(
                    function (entries, observer) {

                        entries.forEach(function (entry) {

                            if (entry.isIntersecting) {

                                const counter =
                                    entry.target;

                                if (
                                    !counter.dataset.started
                                ) {

                                    counter.dataset.started =
                                        "true";

                                    animateCounter(
                                        counter
                                    );

                                    observer.unobserve(
                                        counter
                                    );
                                }
                            }

                        });

                    },
                    {
                        threshold: 0.5
                    }
                );

            counters.forEach(function (counter) {

                counterObserver.observe(counter);

            });

        } else {

            counters.forEach(function (counter) {

                animateCounter(counter);

            });

        }
    }


    /* =====================================================
       04. COURSE FILTER
       ===================================================== */

    const filterButtons =
        document.querySelectorAll(
            ".course-filter"
        );

    const courseCards =
        document.querySelectorAll(
            ".catalog-card"
        );

    if (
        filterButtons.length > 0 &&
        courseCards.length > 0
    ) {

        filterButtons.forEach(function (button) {

            button.addEventListener(
                "click",
                function () {

                    /*
                     * Remove active class
                     */

                    filterButtons.forEach(
                        function (btn) {

                            btn.classList.remove(
                                "active"
                            );

                        }
                    );


                    /*
                     * Add active class
                     */

                    button.classList.add(
                        "active"
                    );


                    /*
                     * Get selected category
                     */

                    const selectedCategory =
                        button.getAttribute(
                            "data-filter"
                        );


                    /*
                     * Show / hide courses
                     */

                    courseCards.forEach(
                        function (card) {

                            const category =
                                card.getAttribute(
                                    "data-category"
                                );


                            if (
                                selectedCategory ===
                                "all" ||
                                category ===
                                selectedCategory
                            ) {

                                card.style.display =
                                    "flex";

                                setTimeout(
                                    function () {

                                        card.style.opacity =
                                            "1";

                                        card.style.transform =
                                            "translateY(0)";

                                    },
                                    20
                                );

                            } else {

                                card.style.opacity =
                                    "0";

                                card.style.transform =
                                    "translateY(10px)";

                                setTimeout(
                                    function () {

                                        card.style.display =
                                            "none";

                                    },
                                    200
                                );

                            }

                        }
                    );

                }
            );

        });

    }


    /* =====================================================
       05. SMOOTH SCROLL
       ===================================================== */

    const smoothLinks =
        document.querySelectorAll(
            'a[href^="#"]'
        );

    smoothLinks.forEach(function (link) {

        link.addEventListener(
            "click",
            function (event) {

                const targetId =
                    link.getAttribute("href");

                if (
                    !targetId ||
                    targetId === "#"
                ) {
                    return;
                }

                const target =
                    document.querySelector(
                        targetId
                    );

                if (target) {

                    event.preventDefault();

                    const header =
                        document.querySelector(
                            ".site-header"
                        );

                    const headerHeight =
                        header
                            ? header.offsetHeight
                            : 0;

                    const targetPosition =
                        target.getBoundingClientRect()
                            .top +
                        window.scrollY -
                        headerHeight -
                        10;

                    window.scrollTo({

                        top: targetPosition,

                        behavior: "smooth"

                    });

                }

            }
        );

    });


    /* =====================================================
       06. SCROLL TO TOP
       ===================================================== */

    const scrollTopButton =
        document.querySelector(
            ".scroll-top"
        );

    if (scrollTopButton) {

        window.addEventListener(
            "scroll",
            function () {

                if (window.scrollY > 500) {

                    scrollTopButton.classList.add(
                        "show"
                    );

                } else {

                    scrollTopButton.classList.remove(
                        "show"
                    );

                }

            }
        );


        scrollTopButton.addEventListener(
            "click",
            function () {

                window.scrollTo({

                    top: 0,

                    behavior: "smooth"

                });

            }
        );

    }


    /* =====================================================
       07. HEADER SHADOW ON SCROLL
       ===================================================== */

    const header =
        document.querySelector(
            ".site-header"
        );

    if (header) {

        window.addEventListener(
            "scroll",
            function () {

                if (window.scrollY > 20) {

                    header.classList.add(
                        "scrolled"
                    );

                } else {

                    header.classList.remove(
                        "scrolled"
                    );

                }

            }
        );

    }


    /* =====================================================
       08. ENQUIRY FORM BASIC VALIDATION
       ===================================================== */

    const enquiryForm =
        document.querySelector(
            "#enquiryForm"
        );

    if (enquiryForm) {

        enquiryForm.addEventListener(
            "submit",
            function (event) {

                const name =
                    document.querySelector(
                        "#studentName"
                    );

                const phone =
                    document.querySelector(
                        "#phone"
                    );

                const course =
                    document.querySelector(
                        "#course"
                    );


                /*
                 * Basic validation
                 */

                if (
                    name &&
                    name.value.trim().length < 2
                ) {

                    event.preventDefault();

                    alert(
                        "Please enter student's full name."
                    );

                    name.focus();

                    return;
                }


                if (
                    phone &&
                    !/^[0-9]{10}$/.test(
                        phone.value.trim()
                    )
                ) {

                    event.preventDefault();

                    alert(
                        "Please enter a valid 10-digit mobile number."
                    );

                    phone.focus();

                    return;
                }


                if (
                    course &&
                    course.value === ""
                ) {

                    event.preventDefault();

                    alert(
                        "Please select a course."
                    );

                    course.focus();

                    return;
                }


                /*
                 * No backend connected yet, so the
                 * enquiry is saved locally and picked
                 * up by the admin "Enquiries" page.
                 */

                event.preventDefault();

                const mode =
                    document.querySelector(
                        'input[name="learning_mode"]:checked'
                    );

                const messageField =
                    document.querySelector(
                        "#message"
                    );

                const enquiry = {
                    id: "ENQ" + Date.now(),
                    name: name ? name.value.trim() : "",
                    fatherName:
                        (document.querySelector("#fatherName") || {}).value || "",
                    studentClass:
                        (document.querySelector("#studentClass") || {}).value || "",
                    phone: phone ? phone.value.trim() : "",
                    email:
                        (document.querySelector("#email") || {}).value || "",
                    course: course ? course.value : "",
                    mode: mode ? mode.value : "",
                    message: messageField ? messageField.value.trim() : "",
                    date: new Date().toISOString(),
                    status: "New"
                };

                let enquiries = [];

                try {
                    enquiries =
                        JSON.parse(
                            localStorage.getItem("lbEnquiries")
                        ) || [];
                } catch (error) {
                    enquiries = [];
                }

                enquiries.push(enquiry);

                localStorage.setItem(
                    "lbEnquiries",
                    JSON.stringify(enquiries)
                );

                enquiryForm.reset();

                alert(
                    "Thank you! Your enquiry has been " +
                    "submitted. Our team will contact you soon."
                );

            }
        );

    }


    /* =====================================================
       10. CERTIFICATE VERIFICATION
       ===================================================== */

    const certificateVerificationForm =
        document.querySelector(
            "#certificateVerificationForm"
        );

    if (certificateVerificationForm) {

        certificateVerificationForm.addEventListener(
            "submit",
            function (event) {

                event.preventDefault();

                const input =
                    document.querySelector(
                        "#certificateNumber"
                    );

                const resultBox =
                    document.querySelector(
                        "#certificateResult"
                    );

                if (!input || !resultBox) {
                    return;
                }

                const value =
                    input.value.trim().toLowerCase();

                let certificates = [];

                try {
                    certificates =
                        JSON.parse(
                            localStorage.getItem("lbCertificates")
                        ) || [];
                } catch (error) {
                    certificates = [];
                }

                const found =
                    certificates.find(function (item) {
                        return (
                            (item.certificateNumber || "")
                                .toLowerCase() === value
                        );
                    });

                if (found) {

                    resultBox.innerHTML =
                        '<div class="verification-card is-success">' +
                            '<div class="verification-status-row">' +
                                '<span class="verification-status-icon">✔</span>' +
                                '<div><h3>Certificate Verified</h3>' +
                                '<p>This certificate record is genuine and on file.</p></div>' +
                            '</div>' +
                            '<div class="verification-details">' +
                                '<div class="verification-detail-row"><span>Student Name</span><strong>' + (found.studentName || "--") + '</strong></div>' +
                                '<div class="verification-detail-row"><span>Certificate No.</span><strong>' + (found.certificateNumber || "--") + '</strong></div>' +
                                '<div class="verification-detail-row"><span>Course</span><strong>' + (found.course || "--") + '</strong></div>' +
                                '<div class="verification-detail-row"><span>Duration</span><strong>' + (found.duration || "--") + '</strong></div>' +
                                '<div class="verification-detail-row"><span>Grade</span><strong>' + (found.grade || "--") + '</strong></div>' +
                                '<div class="verification-detail-row"><span>Issue Date</span><strong>' + (found.issueDate || "--") + '</strong></div>' +
                            '</div>' +
                        '</div>';

                } else {

                    resultBox.innerHTML =
                        '<div class="verification-card is-error">' +
                            '<div class="verification-status-row">' +
                                '<span class="verification-status-icon">✕</span>' +
                                '<div><h3>Certificate Not Found</h3>' +
                                '<p>No record matches this certificate number. Please check and try again.</p></div>' +
                            '</div>' +
                        '</div>';

                }

            }
        );

    }


    /* =====================================================
       11. ID CARD VERIFICATION
       ===================================================== */

    const idCardVerificationForm =
        document.querySelector(
            "#idCardVerificationForm"
        );

    if (idCardVerificationForm) {

        idCardVerificationForm.addEventListener(
            "submit",
            function (event) {

                event.preventDefault();

                const input =
                    document.querySelector(
                        "#idCardNumber"
                    );

                const resultBox =
                    document.querySelector(
                        "#idCardResult"
                    );

                if (!input || !resultBox) {
                    return;
                }

                const value =
                    input.value.trim().toLowerCase();

                let students = [];

                try {
                    students =
                        JSON.parse(
                            localStorage.getItem("lbStudents")
                        ) || [];
                } catch (error) {
                    students = [];
                }

                const found =
                    students.find(function (item) {
                        return (
                            (item.idCardNumber || "")
                                .toLowerCase() === value
                        );
                    });

                if (found) {

                    resultBox.innerHTML =
                        '<div class="verification-card is-success">' +
                            '<div class="verification-status-row">' +
                                '<span class="verification-status-icon">✔</span>' +
                                '<div><h3>ID Card Verified</h3>' +
                                '<p>This student ID card is genuine and on file.</p></div>' +
                            '</div>' +
                            '<div class="verification-details">' +
                                '<div class="verification-detail-row"><span>Student Name</span><strong>' + (found.name || "--") + '</strong></div>' +
                                '<div class="verification-detail-row"><span>ID Card No.</span><strong>' + (found.idCardNumber || "--") + '</strong></div>' +
                                '<div class="verification-detail-row"><span>Course</span><strong>' + (found.course || "--") + '</strong></div>' +
                                '<div class="verification-detail-row"><span>Student ID</span><strong>' + (found.id || "--") + '</strong></div>' +
                                '<div class="verification-detail-row"><span>Status</span><strong>' + (found.status || "Active") + '</strong></div>' +
                                '<div class="verification-detail-row"><span>Joining Date</span><strong>' + (found.joiningDate || "--") + '</strong></div>' +
                            '</div>' +
                        '</div>';

                } else {

                    resultBox.innerHTML =
                        '<div class="verification-card is-error">' +
                            '<div class="verification-status-row">' +
                                '<span class="verification-status-icon">✕</span>' +
                                '<div><h3>ID Card Not Found</h3>' +
                                '<p>No record matches this ID card number. Please check and try again.</p></div>' +
                            '</div>' +
                        '</div>';

                }

            }
        );

    }


    /* =====================================================
       09. PHONE NUMBER VALIDATION
       ===================================================== */

    const phoneInputs =
        document.querySelectorAll(
            'input[type="tel"]'
        );

    phoneInputs.forEach(function (input) {

        input.addEventListener(
            "input",
            function () {

                /*
                 * Only numbers
                 */

                this.value =
                    this.value.replace(
                        /[^0-9]/g,
                        ""
                    );


                /*
                 * Maximum 10 digits
                 */

                if (
                    this.value.length > 10
                ) {

                    this.value =
                        this.value.slice(
                            0,
                            10
                        );

                }

            }
        );

    });


    /* =====================================================
       10. CURRENT YEAR
       ===================================================== */

    const yearElements =
        document.querySelectorAll(
            "[data-year]"
        );

    yearElements.forEach(function (element) {

        element.textContent =
            new Date().getFullYear();

    });


    /* =====================================================
       11. REVEAL ANIMATION
       ===================================================== */

    const revealElements =
        document.querySelectorAll(
            ".reveal"
        );

    if (
        revealElements.length > 0 &&
        "IntersectionObserver" in window
    ) {

        const revealObserver =
            new IntersectionObserver(
                function (entries, observer) {

                    entries.forEach(
                        function (entry) {

                            if (
                                entry.isIntersecting
                            ) {

                                entry.target.classList.add(
                                    "visible"
                                );

                                observer.unobserve(
                                    entry.target
                                );

                            }

                        }
                    );

                },
                {
                    threshold: 0.12
                }
            );


        revealElements.forEach(
            function (element) {

                revealObserver.observe(
                    element
                );

            }
        );

    } else {

        revealElements.forEach(
            function (element) {

                element.classList.add(
                    "visible"
                );

            }
        );

    }


    /* =====================================================
       12. PREVENT EMPTY BUTTON ACTION
       ===================================================== */

    const emptyLinks =
        document.querySelectorAll(
            'a[href="#"]'
        );

    emptyLinks.forEach(function (link) {

        link.addEventListener(
            "click",
            function (event) {

                event.preventDefault();

            }
        );

    });


    /* =====================================================
       13. WHATSAPP BUTTON
       ===================================================== */

    const whatsappButtons =
        document.querySelectorAll(
            "[data-whatsapp]"
        );

    whatsappButtons.forEach(
        function (button) {

            button.addEventListener(
                "click",
                function () {

                    const message =
                        button.getAttribute(
                            "data-whatsapp"
                        ) ||
                        "Hello, I want information about courses at LB Computer Institute.";

                    const encodedMessage =
                        encodeURIComponent(
                            message
                        );

                    const whatsappNumber =
                        "919815250155";

                    const whatsappURL =
                        "https://wa.me/" +
                        whatsappNumber +
                        "?text=" +
                        encodedMessage;

                    window.open(
                        whatsappURL,
                        "_blank"
                    );

                }
            );

        }
    );


    /* =====================================================
       14. CONSOLE MESSAGE
       ===================================================== */

    console.log(
        "LB Computer Institute website loaded successfully."
    );

});
/* =====================================================
   15. FORGOT PASSWORD FORM
===================================================== */

const forgotPasswordForm =
    document.getElementById("forgotPasswordForm");

const forgotMessage =
    document.getElementById("forgotMessage");


if (forgotPasswordForm) {

    forgotPasswordForm.addEventListener(
        "submit",
        function (event) {

            event.preventDefault();


            const contact =
                document
                    .getElementById("recoveryContact")
                    .value
                    .trim();


            if (!contact) {

                forgotMessage.textContent =
                    "Please enter your email or mobile number.";

                forgotMessage.style.display =
                    "block";

                return;
            }


            forgotMessage.textContent =
                "Your recovery request is ready. Secure OTP/email verification will be connected with the backend.";

            forgotMessage.style.display =
                "block";

            forgotMessage.style.background =
                "#ecfdf3";

            forgotMessage.style.color =
                "#087443";

            forgotMessage.style.border =
                "1px solid #b7ebcf";

        }
    );

}